'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    
    /* NPM */
    
    /* in-package */
    ;

/**
 * @param  {string}  template
 * @param  {object} [data]
 */
function goaty(template, data) {

    // Find placeholders.
    let re = /\$\{[^\}]+\}/g;
    let placeholders = template.match(re);
    let raws = template.split(re);

    // Create functions to do replacement.
    let executors = placeholders.map((placeholder) => {
        /^\$\{([^:]+)(\s*:(.+))?\}$/.test(placeholder);
        let name = RegExp.$1;
        let expr = RegExp.$3;

        let executor = null;
        if (!expr) {
            executor = (data) => {
                if (!data.hasOwnProperty(name)) return '';
                return data[name];
            }
        }
        else {
            let re = /\.|@[\w]+/g;
            let pieces = expr.split(re);
            let atoms = expr.match(re)
            executor = (data) => {
                let fn = (item) => {
                    let text = pieces[0];
                    for (let i = 0; i < atoms.length; i++) {
                        if (atoms[i] == '.') {
                            text += item;
                        }
                        else {
                            text += item[ atoms[i].substring(1) ];
                        }
                        text += pieces[i+1];
                    }
                    return text;
                };
                
                if (!data.hasOwnProperty(name)) return '';
                let item = data[name];
                return (item instanceof Array)
                    ? item.map(fn).join('')
                    : fn(item)
                    ;                
            };
        }

        return executor;
    });


    let run = (data) => {
        let output = raws[0];
        for (let i = 0; i < executors.length; i++) {
            output += executors[i](data);
            output += raws[i+1];
        }
        return output;
    };

    return data ? run(data) : run;
}

module.exports = goaty;