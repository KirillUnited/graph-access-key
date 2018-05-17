document.onmousemove = function (e) {
    if (!dragObject.elem) return; // элемент не зажат

    if (!dragObject.avatar) { // если перенос не начат...

        // посчитать дистанцию, на которую переместился курсор мыши
        var moveX = e.pageX - dragObject.downX;
        var moveY = e.pageY - dragObject.downY;
        if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
            return; // ничего не делать, мышь не передвинулась достаточно далеко
        }

        dragObject.avatar = createAvatar(e); // захватить элемент
        if (!dragObject.avatar) {
            dragObject = {}; // аватар создать не удалось, отмена переноса
            return; // возможно, нельзя захватить за эту часть элемента
        }

        // аватар создан успешно
        // создать вспомогательные свойства shiftX/shiftY
        var coords = getCoords(dragObject.avatar);
        dragObject.shiftX = dragObject.downX - coords.left;
        dragObject.shiftY = dragObject.downY - coords.top;

        startDrag(e); // отобразить начало переноса
    }

    // отобразить перенос объекта при каждом движении мыши
    dragObject.avatar.style.left = e.pageX - dragObject.shiftX + 'px';
    dragObject.avatar.style.top = e.pageY - dragObject.shiftY + 'px';

    return false;
};

function createAvatar(e) {

    // запомнить старые свойства, чтобы вернуться к ним при отмене переноса
    var avatar = dragObject.elem;
    var old = {
        parent: avatar.parentNode,
        nextSibling: avatar.nextSibling,
        position: avatar.position || '',
        left: avatar.left || '',
        top: avatar.top || '',
        zIndex: avatar.zIndex || ''
    };

    // функция для отмены переноса
    avatar.rollback = function () {
        old.parent.insertBefore(avatar, old.nextSibling);
        avatar.style.position = old.position;
        avatar.style.left = old.left;
        avatar.style.top = old.top;
        avatar.style.zIndex = old.zIndex
    };

    return avatar;
};

function startDrag(e) {
    var avatar = dragObject.avatar;

    document.body.appendChild(avatar);
    avatar.style.zIndex = 9999;
    avatar.style.position = 'absolute';
};

function getCoords(elem) { // кроме IE8-
    var box = elem.getBoundingClientRect();

    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };
}