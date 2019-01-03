import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';

let while_code = 'function foo(x, y, z){\n' +
    '   let a = x + 1;\n' +
    '   let b = a + y;\n' +
    '   let c = 0;\n' +
    '   \n' +
    '   while (a < z) {\n' +
    '       c = a + b;\n' +
    '       z = c * 2;\n' +
    '       a++;\n' +
    '   }\n' +
    '   \n' +
    '   return z;\n' +
    '}\n';

let if_code = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n';

let simple_ifelse = 'function foo(x, y, z){\n' +
    '    let a = [1,2]; \n' +
    '    let c;\n' +
    '    if (a[0] < z) {\n' +
    '    if(true){\n' +
    '        c = c + 5;\n' +
    '        }\n' +
    '    } else{\n' +
    '        c = c + z + 5;\n' +
    '        }\n' +
    '    return c;\n' +
    '}\n';

let complex_if = 'function foo(x, y, z){\n' +
    '    let a = [1,2]; \n' +
    '    let c;\n' +
    '    if (a[0] < z) \n' +
    '    \tif(true){\n' +
    '        \tc = c + 5;\n' +
    '\t\t}else\n' +
    '\t\t\t{c=c+6}\n' +
    '\telse \n' +
    '    {\n' +
    '    a[0]=1;\n' +
    '    }\n' +
    '    return c;\n' +
    '}\n';

let while_parsed_true = parseCode(while_code,[1,2,3]);
let while_parsed_false = parseCode(while_code,[0,0,0]);
let simple_fielse_parsed = parseCode(simple_ifelse,[0,0,0]);
let complex_if_parsed = parseCode(complex_if,[1,2,3]);
let if_parsed = parseCode(if_code,[1,2,3]);

describe('while graph', () => {
    it('number of objects check', () => {
        assert.equal(
            while_parsed_true.graph.length,
            5
        );
    });

    it('num of arc', () => {
        assert.equal(
            while_parsed_true.rode.length,
            6
        );
    });
});

describe('while true content', () => {
    it('contain a null object', () => {
        assert.notEqual(

            while_parsed_true.graph.find((x)=>x.value === 'NULL') ,
            undefined        );
    });
    it('contain an condition object', () => {
        assert.notEqual(
            while_parsed_true.graph.find((x)=> x.type === 'condition')  ,
            undefined
        );
    });
});

describe('empty content', () => {
    it('contain a null object', () => {
        assert.notEqual(
            parseCode('',[]),
            ''
        );
    });
});


describe('if graph', () => {
    it('number of objects check', () => {
        assert.equal(
            if_parsed.graph.length,
            7
        );
    });

    it('num of arc', () => {
        assert.equal(
            if_parsed.rode.length,
            12
        );
    });
    it('while statemant false', () => {
        assert.notEqual(
            while_parsed_false.graph[2],
            'green'
        );
    });
    it('complex if',() =>{
        assert.equal(
            complex_if_parsed.rode.length,
            12
        );
    });

});

describe('simple if content', () => {
    it('simple else if', () => {
        assert.equal(
            simple_fielse_parsed.graph.length ,
            6
        );
    });
});

describe('if content', () => {
    it('contain an condition object', () => {
        assert.notEqual(
            if_parsed.graph.find((x)=> x.type === 'condition') ,
            undefined
        );
    });

    it('contain 2 condition object', () => {
        assert.equal(
            (if_parsed.graph.filter((x)=> x.type === 'condition')).length,
            2
        );
    });
    it('contain rode object with yes', () => {
        assert.equal(
            if_parsed.rode.filter((x)=> x.optional === 'yes').length > 0,
            true

        );
    });

    it('contain rode object with No', () => {
        assert.equal(
            if_parsed.rode.filter((x)=> x.optional === 'no').length > 0,
            true

        );
    });
});

