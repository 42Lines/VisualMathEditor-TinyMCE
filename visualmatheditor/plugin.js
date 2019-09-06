(function () {
    'use strict';
    var vmeWindow = null;
    var setup = function (editor, url) {
        editor.addButton('visualmatheditor', {
            title: 'Visual Math Editor',
            image: url + '/img/formula.png',
            onClick: function () {
                // check if formula selected and use tex in this case
                if (isFormula(editor.selection.getNode())) {
                    openEditor(editor.selection.getNode().getAttribute('data-vme-tex'), 'en_US', 'aguas');
                }
                else {
                    // open empty editor
                    openEditor('', 'en_US', 'aguas');
                }
            }
        });
        // Adds a menu item to the insert menu
        editor.addMenuItem('visualmatheditor', {
            text: 'Visual Math Editor',
            context: 'insert',
            image: url + '/img/formula.png',
            onclick: function () {
                // open empty editor
                openEditor('', 'en_US', 'aguas');
            }
        });
        editor.on('dblclick', function (e) {
            registerDblClickHandler(e.target);
        });
    };
    function isFormula(node) {
        if (node && 'img' === node.nodeName.toLowerCase() && node.hasAttribute('data-vme-tex')) {
            return true;
        }
        return false;
    }
    function registerDblClickHandler(node) {
        if (isFormula(node)) {
            openEditor(node.getAttribute('data-vme-tex'), 'en_US', 'aguas');
            tinymce.activeEditor.selection.select(node);
        }
    }
    function Plugin() {
        tinymce.PluginManager.add('visualmatheditor', setup);
    }
    Plugin();
}());
/*
VisualMathEditor, (function.js)
Copyright © 2005-2014 David Grima, contact@equatheque.com under the terms of the GNU General Public License, version 3.
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses.
*/
/*jslint browser: true */
/*
For jslint Options
-browser: true to assume there is an instance of the object window
*/
// Global VME objects _________________________________________________________________
var openEditor; // fonction globale pour l'ouverture d'une fenètre VME
var winVME = null; // variable globale pour concerver la fenètre VME
var intervalVME = null; // hack pour contourner le bug window.opener not set in iOS Chrome, voir vme.getEquationFromCaller() de VisualMathEditor.js
// End Global objects
var insertOrReplaceFormula;
var mj2img;
(function ($) {
    'use strict';
    $(function () {
        $(document).on('focusin', '.field, textarea', function () {
            if (this.title === this.value) {
                this.value = '';
            }
        }).on('focusout', '.field, textarea', function () {
            if (this.value === '') {
                this.value = this.title;
            }
        });
        $('.main .cols .col:last, .footer-cols .col:last ').addClass('last');
        $('.footer-nav ul li:first-child ').addClass('first');
        $('.top-nav ul li:last-child').addClass('last');
        $('.top-nav ul li:first-child').addClass('first');
        $('.sidebar ul li:last-child').addClass('last');
        $('.top-nav a.nav-btn').click(function () {
            $(this).closest('.shell').find('ul').stop(true, true).slideToggle();
            $(this).find('span').toggleClass('active');
            return false;
        });
    });
    $(window).load(function () {
        if ($.flexslider !== undefined) {
            $('.flexslider').flexslider({
                animation: 'slide',
                controlsContainer: '.flexslider',
                slideshowSpeed: 3000,
                directionNav: false,
                controlNav: true,
                animationDuration: 900
            });
        }
        // Module to Deal with the menu:
        (function () {
            $('a.local-link[href^="#"]').click(function () {
                $('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top - 20 });
                return false;
            });
        }());
    });
    /*
    Fonctions pour contoler complètement le chargement de l'editeur et optimiser les changements d'équation si l'éditeur est déjà ouvert.
    Comme l'éditeur est normalement prévu pour être ouvert à partir d'une URL, il a fallut utiliser les variables et les fonctions privées de l'éditeur.
    Heureusement qu'elles sont accessibles :-)
    */
    $(window).bind('unload beforeunload', function () {
        if (localStorage) {
            localStorage.clear(); // hack pour contourner le bug window.opener not set in iOS Chrome, voir vme.getEquationFromCaller() de VisualMathEditor.js
        }
    });
    window.openEditor = function openVisualMathEditor(equation, i18n, style) {
        /* Si la fenêtre VME est déjà ouverte, nous utilisons l'API de l'object vme pour réinitialiser les variables */
        if (winVME && !winVME.closed && winVME.vme !== undefined) {
            var vme_1 = winVME.vme;
            var latex = equation;
            // initialisation du code latex à partir de l'équation passé en paramètre
            vme_1.textareaIgnore = true;
            vme_1.textareaID = null;
            vme_1.textAreaForSaveASCII = null;
            if (!winVME.$('#mUPDATE_EQUATION').hasClass('menu-item-disabled')) {
                winVME.$('#mUPDATE_EQUATION').addClass('menu-item-disabled').click(function () { vme_1.getEquationFromCaller(); });
            }
            if (!winVME.$('#mSET_EQUATION').hasClass('menu-item-disabled')) {
                winVME.$('#mSET_EQUATION').addClass('menu-item-disabled').click(function () { vme_1.setEquationInCaller(); });
            }
            if (!vme_1.runNotCodeMirror) {
                vme_1.codeMirrorEditor.setValue(latex);
                vme_1.setCodeMirrorCursorAtEnd();
            }
            else {
                vme_1.mathTextInput.value = latex;
            }
            // initialisation du style à partir de celui passé en paramètre
            vme_1.style = style;
            winVME.$('[name=', 'style', ']').filter('[value=' + vme_1.style + ']').attr('checked', 'checked');
            vme_1.chooseStyle();
            // initialisation du langage à partir de celui passé en paramètre
            vme_1.localType = i18n;
            winVME.$('[name=', 'localType', ']').filter('[value=' + vme_1.localType + ']').attr('checked', 'checked');
            vme_1.localize();
            // initialisation du mode non HTML
            vme_1.encloseAllFormula = false;
            winVME.$('#btENCLOSE_TYPE').addClass('unselect');
            winVME.$('#HTML_TAG').hide();
            if (!vme_1.runNotCodeMirror) {
                vme_1.codeMirrorEditor.setOption('mode', 'text/x-latex');
                vme_1.codeMirrorEditor.setOption('autoCloseTags', false);
            }
            vme_1.resizeDivInputOutput();
            // rendu de l'équation à partir du code latex
            vme_1.codeType = 'Latex';
            vme_1.printCodeType();
            vme_1.updateOutput();
            vme_1.saveCookies();
            /* Si la fenêtre VME n'est pas    ouverte, nous l'ouvrons */
        }
        else {
            winVME = window.open('vme/VisualMathEditor.html?runLocal&codeType=Latex&encloseAllFormula=false&style=' + style + '&localType=' + i18n + '&equation=' + equation.replace(/\\/g, '%5C'), 'VisualMathEditor', 'height=580,width=780,top=100,left=100,status=yes,toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=no,modal=no,dependable=yes');
        }
        winVME.focus();
    };
    window.mj2img = function (texstring, callback) {
        var input = texstring;
        var wrapper = document.createElement('div');
        wrapper.innerHTML = input;
        var output = { svg: '', img: '' };
        MathJax.Hub.Queue(['setRenderer', MathJax.Hub, 'SVG']);
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, wrapper]);
        MathJax.Hub.Queue(function () {
            var mjOut = wrapper.getElementsByTagName('svg')[0];
            mjOut.setAttribute('version', '1.1');
            mjOut.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            mjOut.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            output.svg = mjOut.outerHTML.replace(/NS([1-9]|[1-9][0-9]):/g, 'xlink:');
            var image = new Image();
            image.addEventListener('load', function () {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var context = canvas.getContext('2d');
                context.drawImage(image, 0, 0);
                output.img = canvas.toDataURL('image/png');
                callback(output);
            }, false);
            image.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(output.svg)));
        });
    };
    window.insertOrReplaceFormula = function (sometext) {
        mj2img('\\[' + sometext + '\\]', function (output) {
            var img = '<img src="' + output.img + '" data-vme-tex="' + sometext + '"/>';
            tinymce.activeEditor.selection.setContent(img);
        });
    };
}(window.jQuery));
