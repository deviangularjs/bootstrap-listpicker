/**
Bootstrap list picker
Dual licensed under the MIT or GPL Version 2 licenses.

Copyright (c) 2013 Christophe Cassagnabere

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
    
!function ($) {
    "use strict";

    function sortSelectbox(selectbox) {
        selectbox.append(
            $("label", selectbox).sort(function(a, b){
                return (
                    a = $(a).text(),
                    b = $(b).text(),
                    a == 'NA' ? 1 : b == 'NA' ? -1 : 0|a > b
                );
            })
        );                    
    }
    
    function performInputOnClickAction(checkbox, glasspane) {
        var dest, label = checkbox.parent(), src = checkbox.parent().parent();
        label.remove();
        checkbox.click(function () {
            performInputOnClickAction($(this), glasspane);
        });      
        if (checkbox.is(":checked")) {            
            dest = src.siblings(".target-selectbox");
            dest.append(label);
            if (src.children(":visible").size() <= 0) {
                $(".check-all", src.parent()).prop("checked", true);
            }
        } else { 
            var $value = $(".searchbox", src.parent()).val();
            var $filter = $(".filter-tabs li.active a", src.parent()).attr("href").replace('#', '');
             if (label.text().toLowerCase().indexOf($value.toLowerCase()) >= 0
                        && ($filter == "all" || label.attr("data-filters").indexOf($filter) >= 0)) {
                 label.show();
             } else {
                 label.hide();
             }
            dest = src.siblings(".source-selectbox");           
            dest.append(label);   
            if (dest.prop("data-sort")) {
                sortSelectbox(dest);
            }
            if (dest.children(":visible").size() > 0) {
                $(".check-all", src.parent()).prop("checked", false);
            }
        }
        if (glasspane) {
            glasspane.modal('hide');
        }
    }
    
    function performSearchAction (listpicker, value, glasspane) {        
        var $filter = $(".filter-tabs li.active a", listpicker).attr("href").replace('#', '');
        var count = 0;
        if (value.length <= 0) {
            $(".source-selectbox label", listpicker).each(function () {
                if ($filter == "all" || $(this).attr("data-filters").indexOf($filter) >= 0) {
                    $(this).show();
                    count ++;
                } else {
                    $(this).hide();
                }
            });      
        } else if (value.length > 3) {
            $(".source-selectbox label", listpicker).each(function () {
                if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0
                        && ($filter == "all" || $(this).attr("data-filters").indexOf($filter) >= 0)) {
                    $(this).show();
                    count ++;
                } else {
                    $(this).hide();
                }                        
            });               
        }
        $(".check-all", listpicker).prop("checked", count == 0 && $(".target-selectbox label", listpicker).size() > 0);            
        if (glasspane) {
            glasspane.modal('hide');
        }
    }                
                
    function SearchboxOnKeyupEvent (listpicker, value, glasspane) {
        glasspane.modal("show");
        setTimeout(function(){            
            performSearchAction(listpicker, value, glasspane)
        }, 100);
    }
    
    function performCheckallOnClickAction(checkbox, glasspane) {
        var listpicker = checkbox.parent().parent();
        if (checkbox.is(":checked")) {
            $(".source-selectbox label:visible input", listpicker).each(function () {
                $(this).prop("checked", true);
                $(this).parent().remove();
                $(this).click(function () {
                    performInputOnClickAction($(this), glasspane);
                });
                $(".target-selectbox", listpicker).append($(this).parent());
            });
        } else {
            $(".target-selectbox label input", listpicker).each(function () {
                $(this).prop("checked", false);
                $(this).parent().remove();
                $(this).click(function () {
                    performInputOnClickAction($(this), glasspane);
                });
                $(".source-selectbox", listpicker).append($(this).parent());                            
                var searchString = $(".searchbox", listpicker).val();
                if (searchString.length > 3) {
                    if ($(this).parent().text().toLowerCase().indexOf(searchString.toLowerCase()) >= 0) {
                        $(this).parent().show();
                    } else {
                        $(this).parent().hide();
                    }
                }
            });
            if ($(".source-selectbox", listpicker).prop("data-sort")) {
                sortSelectbox($(".source-selectbox", listpicker));
            }
        } 
        if (glasspane) {
            glasspane.modal('hide');
        }
    }
    
    function ListPicker(listpicker, options) {
        this.options = this.getOptions(options);
        var $select = $(listpicker);         
        var $container = $(this.options.listpickerContainer)
            .append('<div class="modal hide worker" data-keyboard="false" data-backdrop="static"><i class="icon-cogs"></i><p>&nbsp;Please wait...</p></div>')
            .append('<ul class="nav nav-tabs filter-tabs"><li><a href="#all" data-toggle="tab">All</a></li></ul>')
            .append('<label class="checkbox"><input class="check-all" type="checkbox">Select all</label>')        
            .append('<div class="source-selectbox" />')
            .append('<input class="searchbox input-block-level" type="text" placeholder="Search...">')
            .append('<div class="target-selectbox" />');

        var $filtertabs = new Array();
        $select.children().each($.proxy(function (index, element) {
            // TODO take in account checked and disabled attributes
            var label = ($(element).attr('label') !== undefined) ? $(element).attr('label') : $(element).text();
            var value = $(element).val();
            $.each($(element).attr('data-filters').split(','), function(i, el){
                if($.inArray(el, $filtertabs) === -1) $filtertabs.push(el);
            });            
            var li = $('<label class="checkbox" data-filters="' 
                + $(element).attr('data-filters') 
                + '"><input type="checkbox" value="' 
                + value + '" />' + label + '</label>');            
            $('.source-selectbox' , $container).append(li);            
        }, this));
        
        $.each($filtertabs, function(i, el) {
            $(".filter-tabs", $container).append('<li><a href="#' + el + '" data-toggle="tab">' + el + '</a></li>');
        });
        
        if ($select.attr('data-sort') !== undefined) {
            $(".source-selectbox", $container).prop('data-sort', 
                $select.attr('data-sort') != "false" && $select.attr('data-sort') != "0");            
        } else {
            $(".source-selectbox", $container).prop(
                'data-sort', this.options.sort);
        }
        
        var $glasspane = $(".worker", $container);
        
        $glasspane.on('show hidden', function() {            
            $('body').toggleClass('modal-backdrop-white');
        });        

        $(".source-selectbox label input", $container).click(function(){
            performInputOnClickAction($(this), $glasspane);            
        });

        $(".searchbox", $container).keyup(function() {
            var value = $(this).val();
            clearTimeout($glasspane.attr("pid"));
            if (value.length <= 0 || value.length > 3) {                            
                $glasspane.attr("pid", setTimeout(function() {
                    SearchboxOnKeyupEvent($container, value, $glasspane)
                }, 700));
            }
        });

        $(".searchbox", $container).on('clear', function() {
            var value = $(this).val();
            SearchboxOnKeyupEvent($container, value, $glasspane);
        });

        $(".check-all", $container).click(function() {
            var checkbox = $(this);
            $glasspane.modal("show");
            setTimeout(function(){
                performCheckallOnClickAction(checkbox, $glasspane)
            }, 100);
        });                

        if ($.fn.clearable) {
            $(".searchbox", $container).clearable();
        }

        $(".filter-tabs a[href='#all']", $container).tab("show");
                 
        $(".filter-tabs a", $container).click(function() {                 
            $(".searchbox", $container).trigger("clear");
        });
                 
        $select.after($container).remove();
    }

    ListPicker.prototype = {
            defaults: {
                sort: false,
                listpickerContainer :'<div class="listpicker" />',
                sourceContainer: '<div class="source-selectbox">'
            },

            constructor: ListPicker,

            // Get options by merging defaults and given options.
            getOptions: function(options) {
                    return $.extend({}, this.defaults, options);
            }
    };

    $.fn.listpicker = function (option, parameter) {
        return this.each(function () {
            var data = $(this).data('listpicker');
            var options = typeof option == 'object' && option;

            // Initialize the listpicker.
            if (!data) {
                $(this).data(
                    'listpicker', 
                    (data = new ListPicker($(this), options))
                );
            }

            // Call listpicker method.
            if (typeof option == 'string') {
                data[option](parameter);
            }
        });
    }
}(window.jQuery);
