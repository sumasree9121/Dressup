if (typeof Chat === 'undefined') {
    var Chat = {};
}
$(function () {
    Chat.originalTitle = document.title;

    var to_use_websocket_only_on_chat = window.to_use_websocket_only_on_chat || false;
    var is_on_chat_page = window.is_on_chat_page || false;

    if (typeof is_current_page_considered_offline !== "undefined") {
        return;
    }

    if (to_use_websocket_only_on_chat && !is_on_chat_page) {
        return;
    }

    Chat.socket = new WebSocket(websocketUri);

    Chat.show_ws_connect_progress = true;

    var socket = Chat.socket;

    reinitialize_socket(socket);
});

function reinitialize_socket(socket) {
    Chat.socket = socket;

    var current_page = window.location.href;

    if (socket.readyState !== WebSocket.OPEN && Chat.show_ws_connect_progress) {
        if (current_page.match(/\/chat/gi)) {
            $(".loading_image").show();
            NProgress.start();
        }
    }

    socket.addEventListener("open", function() {
        if (current_page.match(/\/chat/gi)) {
            $(".loading_image").hide();
            NProgress.done();
        }
        console.log("WebSocket established successfully!");
    });

    if (Chat.onlinePresenceUpdateInterval) {
        clearInterval(Chat.onlinePresenceUpdateInterval);
    }
    Chat.onlinePresenceUpdateInterval = setInterval(update_online_presence, online_time_margin_in_seconds * 1000);

    socket.addEventListener("message", function(event) {
        var data = event.data;
        try {
            data = JSON.parse(data);
            if ("type" in data) {
                if (data.type === "pong") {
                    should_disconnect_websocket = false;
                }
                handleWebsocketMessage(data.type, data.data);
            } else {
                console.warn("Invalid websocket message", data);
            }
        } catch (e) {
            console.error("Invalid websocket message", data, "error:", e);
        }
    });

    socket.addEventListener("close", function(event) {
        if (current_page.match(/\/chat/gi)) {
            $(".loading_image").hide();
            NProgress.done();
        }
        console.error("WebSocket closed for some reason:", event);
        if (Chat.onlinePresenceUpdateInterval) {
            clearInterval(Chat.onlinePresenceUpdateInterval);
        }
        if (Chat.pingInterval) {
            clearInterval(Chat.pingInterval);
        }
        if (!location.pathname.startsWith("/chat")) {
            Chat.show_ws_connect_progress = false;
            // $.ajax("/chat/get_main_role", {
            //     type: "POST",
            //     dataType: "json",
            //     success: function(data) {
            //         var _mainRole = data.data;
            //         if (_mainRole === "guest") {
            //             window.location.href = "/";
            //         }
            //     },
            //     error: function(e) {
            //         setTimeout(function() {
            //             reinitialize_socket(new WebSocket(websocketUri));
            //         }, 10 * 1000);
            //     },
            // });
        }
    });

    if (Chat.pingInterval) {
        clearInterval(Chat.pingInterval);
    }
}

function update_online_presence() {
    if (Chat.socket.readyState !== WebSocket.OPEN) {
        return;
    }
    if (typeof is_current_page_considered_offline !== "undefined") {
        return;
    }
    var is_mobile = $(window).width() <= 992;
    if (is_mobile) {
        if (document.visibilityState === "visible") {
            send_update_online_presence();
        }
    } else {
        send_update_online_presence();
    }
}

function send_update_online_presence() {
    var socketKey = "update_online_presence";
    var storageKey = "online_presence_last_sent_at";
    if (typeof localStorage === "undefined") {
        Chat.socket.send(JSON.stringify({ type: socketKey }));
        return;
    }
    var lastSentAt = new Date(parseInt(localStorage.getItem(storageKey) || 0));
    var secondsSinceLastSentAt = Math.ceil((new Date() - lastSentAt) / 1000);
    if (secondsSinceLastSentAt >= online_time_margin_in_seconds) {
        Chat.socket.send(JSON.stringify({ type: socketKey }));
        localStorage.setItem(storageKey, new Date().getTime());
    }
}

function handleWebsocketMessage(type, data) {
    switch (type) {
        case "message": {
            set_notification_count_conditionally(data.notification_count, true);
            cancel_email_by_chat_email_sent_id_with_conditions(data.chat_email_sent_id);
            if (mainRole == "student" && conversationCount == 0 && studentChatEducationPopoverType != 0) {
                updateStudentEducationVariables();
            }
            if (typeof update_unread_message_count === "function") {
                update_unread_message_count(data.conversation_id, data.unread_message_count);
            }
            break;
        }
        case "message_bulk": {
            if (!location.pathname.startsWith("/chat")) {
                $.ajax("/chat/get_conversation_by_internship_id", {
                    data: {
                        internship_id: data.internship_id,
                    },
                    success: get_and_set_notification_count,
                    type: "POST",
                    dataType: "json",
                });
            }
            cancel_email_by_internship_id_with_conditions(data.internship_id);
            if (mainRole == "student" && conversationCount == 0 && studentChatEducationPopoverType != 0) {
                updateStudentEducationVariables();
            }
            break;
        }
        case "conversation_messages_seen": {
            if (typeof update_unread_message_count === "function") {
                update_unread_message_count(data.chat_conversation_id, 0);
            }
            set_notification_count_conditionally(data.notification_count);
            break;
        }
        case "notification_count": {
            set_notification_count_conditionally(data.notification_count);
            break;
        }
        case "message_and_notification_counts": {
            set_notification_count_conditionally(data.notification_count);
            if (typeof update_unread_message_count === "function") {
                update_unread_message_count(data.conversation_id, data.unread_message_count);
            }
            break;
        }
        case "close_hint": {
            setTimeout(function() {
                $.ajax("/chat/get_main_role", {
                    success: close_websocket_if_logged_out,
                    type: "POST",
                    dataType: "json",
                });
            }, 1000);
            break;
        }
    }
}

function close_websocket_if_logged_out(data) {
    if (data.data === "guest") {
        Chat.socket.close();
        location.href = "/";
    }
}

function set_notification_count_conditionally(count, should_show_notification) {
    if (typeof is_current_page_considered_offline === "undefined") {
        if (!location.pathname.startsWith("/chat")) {
            chat_notification_count(count);
        }
        set_title_notification_count(count);
    }
    if (count === 0) {
        set_show_tab_notification(false);
    } else {
        if (
            should_show_notification &&
            document.visibilityState !== "visible" &&
            typeof is_current_page_considered_offline === "undefined"
        ) {
            set_show_tab_notification(true);
        }
    }
}

function updateStudentEducationVariables() {
    $.ajax("/chat/update_student_education_chat_variables", {
        success: updateStudentEducationVariablesSuccess,
        error: function() {},
        type: "POST",
    });
}

function updateStudentEducationVariablesSuccess(data) {
    try {
        if (!data.success) {
            //Do Nothing
        } else {
            conversationCount = parseInt(data.conversationCount);
            if (studentChatEducationPopoverType === 1) {
                studentChatEducationPopoverType = 2;
            }
            if (typeof is_current_page_considered_offline === "undefined") {
                $("html, body").animate({ scrollTop: 0 }, "slow");
                var event = { data: { dont_go_to_chat: true } };
                handleHeaderChatIconClick(event);
            }
        }
    } catch (e) {
        throw_error(e);
        $(".loading_image").hide();
    }
}

function cancel_email_by_chat_email_sent_id_with_conditions(chat_email_sent_id) {
    var is_mobile = $(window).width() <= 992;
    if (chat_email_sent_id && typeof is_current_page_considered_offline === "undefined") {
        if (is_mobile && document.visibilityState !== "visible") {
            return;
        }
        $.post("/chat/cancel_email_by_chat_email_sent_id", {
            chat_email_sent_id: chat_email_sent_id,
        });
    }
}

function cancel_email_by_internship_id_with_conditions(internship_id) {
    var is_mobile = $(window).width() <= 992;
    if (internship_id && typeof is_current_page_considered_offline === "undefined") {
        if (is_mobile && document.visibilityState !== "visible") {
            return;
        }
        $.post("/chat/cancel_email_by_internship_id", {
            internship_id: internship_id,
        });
    }
}

function get_and_set_notification_count(data) {
    var conversation_id = data.data.id;
    $.ajax("/chat/get_unread_message_and_notification_counts", {
        data: {
            chat_conversation_id: conversation_id,
        },
        type: "POST",
        dataType: "json",
        success: function(data2) {
            var notification_count = data2.data.notification_count;
            set_notification_count_conditionally(notification_count, true);
        },
    });
}

var sound = new Audio("/static/audio/notification.mp3");
sound.addEventListener("loadeddata", function() {
    window.notification_sound = sound;
});

function set_show_tab_notification(shouldShowNotification) {
    var href = shouldShowNotification ? "/favicon-notification.ico?v=3" : "/favicon.ico?v=3";
    var is_mobile = $(window).width() <= 992;
    if (shouldShowNotification && !is_mobile) {
        console.warn("Playing notificaton now");
        window.notification_sound
            .play()
            .then(function() {
                console.log("played notification");
            })
            .catch(function(e) {
                console.log("failed to play because of error", e, "(also logged to window.notifError)");
                window.notifError = e;
            });
    }
    var link = document.querySelector("link[rel*='icon']") || document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "icon";
    link.href = href;
    document.getElementsByTagName("head")[0].appendChild(link);
}

function chat_notification_count(count) {
    $parent_element = $(".header_chat_notification_unread_count");
    $notification_label = $parent_element.find(".notification-label");
    if (typeof count === "undefined") {
        return parseInt($notification_label.first().text());
    }
    set_title_notification_count(count);
    if (count === 0) {
        $parent_element.css("display", "none");
    } else {
        $(".navbar-header .header_chat_notification_unread_count").css("display", "inline-block");
        $(".nav .header_chat_notification_unread_count").css("display", "block");

        $(".navbar-expand-md .navbar_mobile .header_chat_notification_unread_count").css("display", "inline-block");
        $(".navbar-expand-md .navbar_desktop .header_chat_notification_unread_count").css("display", "block");
    }
    $notification_label.text(count);
}

function set_title_notification_count(count) {
    if (!Chat.originalTitle) {
        return;
    }
    if (document.visibilityState === "visible") {
        document.title = Chat.originalTitle;
        return;
    }
    if (count > 0) {
        document.title = "(" + count + ") " + Chat.originalTitle;
    } else {
        document.title = Chat.originalTitle;
    }
}

document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "visible") {
        set_show_tab_notification(false);
        set_title_notification_count(0);
    }
});
