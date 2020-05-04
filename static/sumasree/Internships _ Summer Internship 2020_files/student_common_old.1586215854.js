var isChatPopoverVisible = 0;

$(document).ready(function () {
    if (toShowEducation && typeof is_current_page_considered_offline === 'undefined') {
        if (typeof mainRole != "undefined" && mainRole == "student") {
            var currentUrl = window.location.href;
            if (currentUrl.indexOf("/application/form/") >= 0) {
            } else {
                if (typeof studentChatEducationPopoverType != "undefined" && studentChatEducationPopoverType == 2) {
                    if (currentUrl.indexOf("/chat/") >= 0) {
                        education_notification_first_popover_atleast_message("chat");
                        $(".student_atleast_view_message").hide();
                    } else {
                        if (typeof to_show_notification_modal !== "undefined" && to_show_notification_modal == "1") {

                        } else {
                            education_notification_first_popover_atleast_message();
                            studentChatEducationPopoverType = 0;
                        }
                    }
                }


                if (studentChatEducationPopoverType == 3) {
                    hideModalONClickingOutside();
                }
            }
        }
    }
});
function hideModalONClickingOutside() {
    $('body').on('click', function (e) {
        var is_mobile = $(window).width() <= 992;
        var notification_class = ".nav .header_chat_notification";
        if (is_mobile) {
            notification_class = ".navbar-header .header_chat_notification";
        }

        var clicked_inside_popover = $(e.target).closest('.popover').length > 0;
        if (clicked_inside_popover) {
            return;
        }
        if (typeof $(notification_class).attr('aria-describedby') != "undefined" && $(notification_class).attr('aria-describedby').length != 0) {
            $('.header_chat_notification').removeClass('chat_notification_count_highlight');
            $('.header_chat_notification').popover('destroy');
        }
    });
}

function handleHeaderChatIconClick(event) {
    var eventData = event.data || {};
    if (toShowEducation) {
        if (typeof studentChatEducationPopoverType != "undefined") {
            if (!isChatPopoverVisible && studentChatEducationPopoverType == 1) {
                education_notification_first_popover_no_message();
                studentChatEducationPopoverType = 3;
            } else if (studentChatEducationPopoverType == 2) {
                var currentUrl = window.location.href;
                if (currentUrl.indexOf("/student/dashboard") >= 0) {
                    if ($('#notification_modal').is(':visible')) {
                    } else {
                        education_notification_first_popover_atleast_message();
                        studentChatEducationPopoverType = 0;
                    }
                } else {
                    education_notification_first_popover_atleast_message();
                    studentChatEducationPopoverType = 0;
                }
            } else if (studentChatEducationPopoverType == 3) {
                if (conversationCount == 0) {
                    if (!isChatPopoverVisible) {
                        education_notification_second_popover_no_message();
                    }
                } else {
                    if (!$(this).hasClass("link") && !eventData.dont_go_to_chat) {
                        window.location = "/chat/";
                    }
                }
            } else if (!isChatPopoverVisible && studentChatEducationPopoverType == 0 && conversationCount > 0) {
                if (!$(this).hasClass("link") && !eventData.dont_go_to_chat) {
                    window.location = "/chat/";
                }
            }
        }
    } else {
        if (conversationCount == 0) {
            education_notification_second_popover_no_message();
        } else {
            if (!$(this).hasClass("link") && !eventData.dont_go_to_chat) {
                window.location = "/chat/";
            }
        }
    }
}

$(document).on('click', '.header_chat_notification', handleHeaderChatIconClick);

function education_notification_first_popover_no_message() {
    isChatPopoverVisible = 1;
    $('.chat_notification_loading_image').show();
    var is_mobile = $(window).width() <= 992;
    var notification_class = ".nav .header_chat_notification";
    if (is_mobile) {
        notification_class = ".navbar-header .header_chat_notification";
    }
    $('.header_chat_notification').addClass('chat_notification_count_highlight');
    $(notification_class).popover({
        placement: 'bottom',
        html: 'true',
        trigger: 'manual',
        content: "<div class='title'>Internshala Chat <span>NEW</span></div>"
                + "<div class='notification_content'><ul type='disc'>"
                + "<li>You can now view messages from different companies and reply to them using Internshala Chat.</li>"
                + "<li>Chat can only be started by the companies that you apply to.</li>"
                + "<li>Once you have received a new message through chat from any company, click on the chat icon to view the message.</li>"
                + "</ul>"
                + "<div class=button_container><button class='btn btn-primary student_no_message_got_it'>Got it</button></div>"
    }).popover('show');
}

function education_notification_second_popover_no_message() {
    $('.chat_notification_loading_image').hide();
    var is_mobile = $(window).width() <= 992;
    var notification_class = ".nav .header_chat_notification";
    if (is_mobile) {
        notification_class = ".navbar-header .header_chat_notification";
    }

    if (typeof $(notification_class).attr('aria-describedby') != "undefined" && $(notification_class).attr('aria-describedby').length != 0) {
        $('.header_chat_notification').removeClass('chat_notification_count_highlight');
        $('.header_chat_notification').popover('destroy');
    } else {
        $('.header_chat_notification').removeClass('chat_notification_count_highlight');
        $('.header_chat_notification').popover('destroy');
        setTimeout(function () {
            $(notification_class).popover({
                placement: 'bottom',
                html: 'true',
                trigger: 'manual',
                content: "<div class='notification_content'>You have not yet received any message through chat. Chat can be started only by the companies that you have applied to.</div>"
            }).popover('show');
        }, 200);
    }
}

function education_notification_first_popover_atleast_message(source) {
    isChatPopoverVisible = 1;
    var is_mobile = $(window).width() <= 992;
    var notification_class = ".nav .header_chat_notification";
    if (is_mobile) {
        notification_class = ".navbar-header .header_chat_notification";
    }
    $('.header_chat_notification').addClass('chat_notification_count_highlight');
    $(notification_class).popover({
        placement: 'bottom',
        html: 'true',
        trigger: 'manual',
        content: "<div class='title'>Internshala Chat <span>NEW</span></div>"
                + "<div class='notification_content'><ul type='disc'>"
                + "<li>You can now view messages from different companies and reply to them using Internshala Chat.</li>"
                + "<li>Chat can only be started by the companies that you apply to.</li>"
                + ((typeof source != "undefined" && source == "chat") ? "<li>Once you have received a new message from any company, click on the chat icon to view the message.</li>" : "<li>Looks like you have received new message(s) through chat. Click on 'Go to Chat' to read them.</li>")
                + "</ul>"
                + "<div class=button_container>"
                + ((typeof source != "undefined" && source == "chat") ? "<button class='btn btn-primary student_atleast_one_got_it'>GOT IT</button>" : "<span class='got_it student_atleast_one_got_it'>GOT IT</span>")
                + "<button class='btn btn-primary student_atleast_view_message'>Go to Chat</button>"
                + "</div>"
    }).popover('show');
    $('.chat_notification_loading_image').show();
}

$(document).on('click', '.student_atleast_one_got_it', function () {
    if (toShowEducation) {
        $('.header_chat_notification').popover('hide');
        $('.header_chat_notification').removeClass('chat_notification_count_highlight');
        $('.chat_notification_loading_image').hide();
        isChatPopoverVisible = 0;
        studentChatEducationPopoverType = 0;
        update_notification_status();
        if (location.pathname.startsWith('/chat/') && Chat.onEducationGotItClick) {
            Chat.onEducationGotItClick();
        }
    }
});
$(document).on('click', '.student_atleast_view_message', function () {
    if (toShowEducation) {
        $('.header_chat_notification').popover('hide');
        $('.header_chat_notification').removeClass('chat_notification_count_highlight');
        $('.chat_notification_loading_image').hide();
        isChatPopoverVisible = 0;
        $.ajax('/chat/update_student_chat_notification', {
            success: function () {
                window.location = "/chat";
            },
            error: function () {

            },
            type: "POST"
        });
    }
});
$(document).on('click', '.student_no_message_got_it', function () {
    if (toShowEducation) {
        $('.header_chat_notification').popover('hide');
        $('.header_chat_notification').removeClass('chat_notification_count_highlight');
        $('.chat_notification_loading_image').hide();
        update_notification_status();
        isChatPopoverVisible = 0;
    }
});
function update_notification_status() {
    $.ajax('/chat/update_student_chat_notification', {
        success: function () {
            hideModalONClickingOutside();
        },
        error: function () {

        },
        type: "POST"
    });
}

