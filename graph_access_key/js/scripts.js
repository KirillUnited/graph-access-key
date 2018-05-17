var pointChecked = [];
var point, dot;
var dragObject = {};
var opt = {};
document.onmousedown = function (e) {
    var point = e.target.closest('.point');
    if (!point) {
        return;
    }
    if (point.classList.contains('point_selected')) {
        return;
    }
    var dot = point.children[0];
    var id = point.getAttribute('id');
    pointChecked.push(id);
    point.classList.toggle('point_selected');
    dot.classList.toggle('point_selected');
    // запомнить переносимый объект
    dragObject.elem = dot;
    dragObject.parentId = id;
    opt.width = dot.clientWidth + 'px';
    opt.height = dot.clientHeigth + 'px';
    // запомнить координаты, с которых начат перенос объекта
    dragObject.downX = e.pageX;
    dragObject.downY = e.pageY;
    var coords = getCoords(dot);
    dragObject.shiftX = coords.left;
    dragObject.shiftY = coords.top;
    document.onmousemove = function (e) {
        var moveX = e.pageX - dragObject.downX;
        var moveY = e.pageY - dragObject.downY;
        if (Math.abs(moveX) < 5 && Math.abs(moveY) < 5) {
            return;
        }
        var move = Math.pow(moveX, 2) + Math.pow(moveY, 2);
        var move = Math.sqrt(move);
        var length = 5;
        var length = length + move;
        var length = Math.abs(length);
        dragObject.elem.style.width = length + 'px';
        dragObject.elem.style.transformOrigin = 'left';
        var p1 = {
            x: 0,
            y: 0
        };
        var p2 = {
            x: moveX,
            y: moveY
        };
        var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        dragObject.elem.style.transform = 'rotate(' + angleDeg + 'deg)';
    };
    console.log(dragObject);
    document.onmouseover = function (e) {
        var dropElem = findDroppable(e);
        if (dropElem) {
            var newCoords = getCoords(dropElem.children[0]);
            var newLengthX = newCoords.left - dragObject.shiftX;
            var newLengthY = newCoords.top - dragObject.shiftY;
            var newLength = Math.pow(newLengthX, 2) + Math.pow(newLengthY, 2);
            var newLength = Math.sqrt(newLength);
            var p1 = {
                x: 0,
                y: 0
            };
            var p2 = {
                x: newLengthX,
                y: newLengthY
            };
            var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
            dragObject.elem.style.transform = 'rotate(' + angleDeg + 'deg)';
            dragObject.elem.style.width = newLength + 'px';
            var currentId = dropElem.getAttribute('id');
            pointChecked.push(currentId);
            dragObject.elem = dropElem.children[0];
            dragObject.shiftX = newCoords.left;
            dragObject.shiftY = newCoords.top;
            dragObject.elem.parentNode.classList.toggle('point_selected');
            dragObject.elem.classList.toggle('point_selected');
            dragObject.downX = e.pageX;
            dragObject.downY = e.pageY;
        };
    };
    document.onmouseup = function (e) {
        document.onmousemove = null;
        document.onmouseover = null;
        document.onmouseup = null;
        var dropElem = findDroppable(e);
        if (!dropElem) {
            back(e);
        }
        dragObject = {};
        console.log(pointChecked);
        verification(e);
    };

    function back(e) {
        dragObject.elem.style.width = '5px';
        dragObject.elem.style.transform = 'translate(-50%, -50%)';
    };

    function findDroppable(e) {
        // спрячем переносимый элемент
        dragObject.elem.hidden = true;

        // получить самый вложенный элемент под курсором мыши
        var el = document.elementFromPoint(e.clientX, e.clientY);
        // показать переносимый элемент обратно
        dragObject.elem.hidden = false;

        if (el == null) {
            // такое возможно, если курсор мыши "вылетел" за границу окна
            return null;
        }
        if (el.classList.contains('point_selected')) {
            return null;
        }
        return el.closest('.point');

    };
    this.ondragstart = function () {
        return false;
    };

    function getCoords(elem) {
        var box = elem.getBoundingClientRect();
        return {
            top: box.top + pageYOffset,
            left: box.left + pageXOffset,
            bottom: box.bottom + pageYOffset,
            right: box.right + pageXOffset
        };
    };
};

function createKey(e) {
    var serialPC = JSON.stringify(pointChecked);
    localStorage.setItem('password', serialPC);
};

function verification(e) {
    var returnPC = JSON.parse(localStorage.getItem('password'));
    var a = pointChecked;
    var b = returnPC;
    var FAIL = 'FAILED';
    var ACCESS = 'ACCESS';
    var div = document.createElement('div');
    var wrapper = document.querySelector('.wrapper');
    if (a.length === b.length) {
        var count = 0;
        for (let i = 0; i < b.length; i++) {
            if (a[i] == b[i]) {
                count++;
            }
        }
        if (count == b.length) {
            console.log(ACCESS);
            div.classList.add('report_submit', 'report');
            div.innerHTML = '<p>!!!' + ACCESS + '!!!</p>';
            document.body.appendChild(div);
            wrapper.classList.add('key-check-wrap_blur');
            reset(e);
            enter(e);
        } else {
            console.log(FAIL);
            div.classList.add('report_fail', 'report');
            div.innerHTML = '<p>!!!' + FAIL + '!!!</p>';
            document.body.appendChild(div);
            wrapper.classList.add('key-check-wrap_blur');
            reset(e);
            abort(e);
        }
    } else {
        console.log(FAIL);
        div.classList.add('report_fail', 'report');
        div.innerHTML = '<p>!!!' + FAIL + '!!!</p>';
        document.body.appendChild(div);
        wrapper.classList.add('key-check-wrap_blur');
        reset(e);
        abort(e);
    }
}

function reset(e) {
    pointChecked = [];
    var point = document.querySelectorAll('.point');
    for (let i = 0; i < point.length; i++) {
        var dot = point[i].children[0];
        point[i].classList.remove('point_selected');
        dot.classList.remove('point_selected');
        dot.style.width = opt.width;
        dot.style.heigth = opt.height;
        dot.style.transform = 'translate(-50%, -50%)';
    }
}

function enter(e) {
    var wrapper = document.querySelector('.wrapper');
    var keyForm = wrapper.children[0];
    var report = document.querySelector('.report');
    var end = setTimeout(function (e) {
        keyForm.remove();
        report.style.opacity = '0';
        report.style.top = '0';
        wrapper.classList.remove('key-check-wrap_blur');
        var after = setInterval(function (e) {
            wrapper.classList.add('wrapper_bg');
            wrapper.style.opacity = '1';
        }, 1000);
    }, 2000);
}

function abort(e) {
    var wrapper = document.querySelector('.wrapper');
    var report = document.querySelector('.report');
    var end = setTimeout(function (e) {
        report.style.opacity = '0';
        report.style.top = '0';
        wrapper.classList.remove('key-check-wrap_blur');
        var after = setInterval(function (e) {
            report.remove();
        }, 2000);
    }, 2000);
}