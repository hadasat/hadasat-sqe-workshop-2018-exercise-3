import $ from 'jquery';
import {parseCode} from './code-analyzer';
import * as flowchart from 'flowchart.js';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parameter_array = '[' + $('#varsValues').val() + ']';
        let parameters = eval(parameter_array);
        let parsedCode = parseCode(codeToParse,parameters);
        let graph_code = make_graph(parsedCode.graph,parsedCode.rode);
        $('#parsedCode').val(JSON.stringify(graph_code, null, 2));
        let diagram = flowchart.parse(graph_code);
        diagram.drawSVG('diagram');
        diagram.drawSVG('diagram',settings);
    });
});

let settings = {
    'x': 0,
    'y': 0,
    'line-width': 3,
    'line-length': 50,
    'text-margin': 10,
    'font-size': 18,
    'font-color': 'black',
    'line-color': 'black',
    'element-color': 'black',
    'fill': 'white',
    'yes-text': 'T',
    'no-text': 'F',
    'arrow-end': 'block',
    'scale': 1,
    // even flowstate support ;-)
    'flowstate' : {
        'green' : { 'fill' : '#31B404'},
        'white' : {'fill' : '#FFFFFF', 'font-color' : 'black', 'font-weight' : 'bold'},
    }
};

function make_rode(rode) {
    let rode_code = '';
    rode.map(function (curr) {
        if (curr.optional != undefined)
            rode_code += curr.source + '(' + curr.optional + ')->' + curr.destination + '\n';
        else
            rode_code += curr.source + '->' + curr.destination +'\n';
    });
    return rode_code;
}

function make_objects(objects) {
    let objects_code = '';
    objects.map(function (curr) {
        objects_code += curr.num + '=>' + curr.type + ': ' +
            curr.num + ')' + curr.value + ' |' + curr.color + '\n';
    });
    return objects_code;
}

function make_graph(objects,rode){
    return make_objects(objects) + make_rode(rode);
}
