/**
 * Plugin para ordenar/desordenar tablas escrito en jQuery.
 * 
 * jquery.tsorter.js v1.0.0
 * 
 * https://goplix.com
 * 
 * Copyright Miguel López Tercero Alarcón
 * Publicado bajo la licencia MIT
 * https://tldrlegal.com/license/mit-license
 * Fecha: 2021-11-30
 */
(function ($) {
    'use strict';

    /**
     * Establece items de ordenación y filtrado en las cabeceras
     * de tipo TH seleccionadas.
     */
    $.fn.tsorter = function (options) {
        options = $.extend({

        }, options);

        let items = []; // Elementos que se convertirán en 'ordenables'

        let $this = this.each(function () {
            items.push(this);
        });

        makeSorter(items, options);

        return $this;
    };

    /**
     * Contruye los elementos plegables recorriendo el array de forma inversa.
     * @param {HTMLTableCellElement} items Array de elementos th.
     */
    function makeSorter(items, options) {
        const TITLE = 'Ordena de forma ascendente o descendente, según el tipo de dato de la columna';

        while (items.length) {
            let item = items.pop();

            /* Cada item se supone que es un elemento 'th', se le agrega antes
             del texto elementos para facilitar la ordenación y búsqueda */
            $(item).html('<span title="' + TITLE + '">&udarr;</span> '
                + '<input type="text" '
                + 'style="display: inline-block; width: 69%;" '
                + 'data-id="' + $(item).index() + '"><br>'
                + $(item).html());

            $(item).find('input[data-id="' + $(item).index() + '"]').keyup(function (e) {
                apply(this);
            });

            $($(item).find('span').eq(0))
                .css('cursor', 'pointer').click(function () {
                    apply(this, true);
                });
        }
    }

    function apply(item, isClick) {
        let th = $(item).parents('th')[0];

        // Seleccionamos la tabla contenedora
        let $table = $(th).parents('table').eq(0);

        let rows = [];
        // Guarda las filas originales en la tabla si no lo están ya
        if (!$table[0].rowsOrig) {
            $table[0].rowsOrig = $table.find('tr:gt(0)').toArray();
        }

        // Agrega solo las filas que pasen los filtros de texto
        for (let row of $table[0].rowsOrig) {
            let add = true;
            for (let i = 0; i < row.children.length; i++) {
                let text = $table.find('input[data-id="' + i + '"]').val();
                if (text && getCellValue(row, i).search(new RegExp(text, 'i')) < 0) {
                    add = false;
                    break;
                }
            }
            if (add) {
                rows.push(row);
            }
        }

        if (isClick) {
            rows = rows.sort(comparer($(th).index()));
            th.asc = !th.asc;
            if (!th.asc) {
                rows = rows.reverse();
            }
        }

        $table.find('tr:gt(0)').remove();
        for (let i = 0; i < rows.length; i++) {
            $table.append(rows[i]);
        }
    }

    /**
     * El comparador, usa una expresión regular para verificar si el valor de
     * la celda es una fecha, en cuyo caso se usa un comparador personalizado.
     * @param {number} index Índice de la columna (base cero).
     * @returns 
     */
    function comparer(index) {
        let dateFormat = /(^\d{1,4}[\.|\\/|-]\d{1,2}[\.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/;

        return function (a, b) {
            let valA = getCellValue(a, index), valB = getCellValue(b, index);

            if (dateFormat.test(valA) && dateFormat.test(valB)) {
                return compareDate(valA, valB);
            }
            return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB);
        }
    }

    /**
     * Devuelve el valor de texto de una columna en una fila.
     * @param {HTMLTableRowElement} row Fila de un elemento TABLE.
     * @param {number} index Índice de la columna (base cero).
     * @returns 
     */
    function getCellValue(row, index) {
        return $(row).children('td').eq(index).text();
    }

    /**
     * Compara dos fechas en formato dd/mm/aaaa.     
     * @param {string} valA Fecha en formato dd/mm/aaaa.
     * @param {string} valB Fecha en formato dd/mm/aaaa.
     * @returns 
     */
    function compareDate(valA, valB) {
        let dateA = new Date(valA.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"));
        let dateB = new Date(valB.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"));

        return dateA > dateB ? 1 : -1;
    }
})(jQuery);
