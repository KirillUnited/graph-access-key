var pointChecked = [];
var point, dot;
var dragObject = {};
var opt = {};
document.onmousedown = function (e) {
    // Для браузеров не поддерживающих Element.closest(), но позволяющих использовать element.matches() (или префиксный эквивалент)
    e.target.matches = e.target.matches || e.target.mozMatchesSelector || e.target.msMatchesSelector || e.target.oMatchesSelector || e.target.webkitMatchesSelector;
    e.target.closest = e.target.closest || function closest(selector) {
        if (!this) return null;
        if (this.matches(selector)) return this;
        if (!this.parentElement) {
            return null
        } else return this.parentElement.closest(selector)
    };
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
    opt.width = dot.clientWidth;
    opt.height = dot.clientHeigth;
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
        var length = Math.abs(opt.width + move);
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
    document.onmouseover = function (e) {
        var dropElem = findDroppable(e);
        if (dropElem) {
            var newCoords = getCoords(dropElem.children[0]);
            var newLengthX = newCoords.left - dragObject.shiftX;
            var newLengthY = newCoords.top - dragObject.shiftY;
            var newLength = Math.sqrt(Math.pow(newLengthX, 2) + Math.pow(newLengthY, 2));
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
        
       
        // Check browser support localStorage
        if (localStorage !== undefined) {
            if (localStorage.getItem('password') == null || localStorage.getItem('password') == undefined) {
                if (pointChecked.length > 3) {
                    createKey(e);
                } else {
                    validPwd(e);
                }
            } else {
                verification(e);
            }
        } else {
            var FAIL = 'Sorry...<br>see https://caniuse.com/#search=localStorage';
            document.body.innerHTML = '<p>!!!' + FAIL + '!!!</p>';
        } 
        // verification(e);
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
        (function (el) {
            el.matches = el.matches || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector || el.webkitMatchesSelector;
            el.closest = el.closest || function closest(selector) {
                if (!this) return null;
                if (this.matches(selector)) return this;
                if (!this.parentElement) {
                    return null
                } else return this.parentElement.closest(selector)
            };
        }(Element.prototype));
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

function validPwd(e) {
    var form = document.querySelector('.popup_access');
    var div = document.createElement('div');
    div.classList.add('valid-pwd');
    div.innerHTML = '<p>minimum 4 points</p>';
    form.appendChild(div);
    reset(e);
    var t = setTimeout(function (e) {
        div.parentNode.removeChild(div);
    }, 2000);
}

function createKey(e) {
    var serialPC = JSON.stringify(pointChecked);
    localStorage.setItem('password', serialPC);
    pwdReport(e);
    reset(e);
    abort(e)
};

function verification(e) {
    var returnPC = JSON.parse(localStorage.getItem('password'));
    // var returnPC = pointChecked; //CHANGE
    var a = pointChecked;
    var b = returnPC;
    if (a.length === b.length) {
        var count = 0;
        for (var i = 0; i < b.length; i++) {
            if (a[i] == b[i]) {
                count++;
            }
        }
        if (count == b.length) {
            accessReport(e)
            reset(e);
            enter(e);
        } else {
            failReport(e)
            reset(e);
            abort(e);
        }
    } else {
        failReport(e)
        reset(e);
        abort(e);
    }
}

function pwdReport(e) {
    var div = document.querySelector('.report');
    div.style.display = 'block';
    div.classList.add('report_submit');
    div.innerHTML = '<p>!!!message!!!</p>';
}

function accessReport(e) {
    var div = document.querySelector('.report');
    div.style.display = 'block';
    div.classList.add('report_submit');
    div.innerHTML = '<p>!!!message!!!</p>';
}

function failReport(e) {
    var div = document.querySelector('.report');
    div.style.display = 'block';
    div.classList.add('report_fail');
    div.innerHTML = '<p>!!!message!!!</p>';
}

function reset(e) {
    pointChecked = [];
    var point = document.querySelectorAll('.point');
    for (var i = 0; i < point.length; i++) {
        var dot = point[i].children[0];
        point[i].classList.remove('point_selected');
        dot.classList.remove('point_selected');
        dot.style.width = opt.width + 'px';
        dot.style.heigth = opt.height + 'px';
        dot.style.transform = 'translate(-50%, -50%)';
    }
}

function enter(e) {
    var wrapper = document.querySelector('.wrapper');
    var keyForm = document.querySelector('#access');
    var report = document.querySelector('.report');
    var txt = report.firstChild;
    
    var end = setTimeout(function (e) {
        keyForm.parentNode.removeChild(keyForm); //fix el.remove() 
        txt.style.opacity = '0';
        txt.style.top = '0';
        var after = setInterval(function (e) {
            wrapper.classList.add('wrapper_bg');
            wrapper.style.opacity = '1';
        }, 1000);
    }, 2000);
}

function abort(e) {
    var wrapper = document.querySelector('.wrapper');
    var report = document.querySelector('.report');
    var txt = report.firstChild;
    var end = setTimeout(function (e) {
        txt.style.opacity = '0';
        txt.style.top = '0';
        var after = setInterval(function (e) {
            report.classList.remove('report_fail');
        }, 2000);
    }, 2000);
}

(function(constructor) {
    if (constructor &&
        constructor.prototype &&
        constructor.prototype.children == null) {
        Object.defineProperty(constructor.prototype, 'children', {
            get: function() {
                var i = 0, node, nodes = this.childNodes, children = [];
                while (node = nodes[i++]) {
                    if (node.nodeType === 1) {
                        children.push(node);
                    }
                }
                return children;
            }
        });
    }
})(window.Node || window.Element);