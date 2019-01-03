import * as esprima from 'esprima';

let variable_table;
let parameters;
let objects_index ;
let objects ;
let rode ;

const parseCode = (codeToParse,parameters_values) => {
    parameters= parameters_values;
    objects = new Array();
    rode = new Array();
    objects_index = 1;
    variable_table = new Array();
    let code= esprima.parseScript(codeToParse);
    parse_start(code,true);
    let return_val = {graph: objects,rode: rode};
    return return_val;
};

function make_rode(source,destination,optioanl) {
    return {source: source,destination:destination,optional:optioanl};
}

function make_object(name,type,value,color) {
    return {num:name,type:type,value:value,color:color};
}
const eval_params = (param_array) => {
    for(let i =0 ; i< param_array.length;i++) {
        let x = param_array[i];
        let name = x.name;
        let value = parameters[i];
        variable_table.push({name:name,value:value});
    }
};

const eval_function_deceleration = (code,green) => {
    eval_params(code.params);
    return parse_start(code.body,green);
};
function get_color(green){
    if(green)
        return 'green';
    return 'white';
}

function get_type_need_to_unit(statement){
    if(statement.type === 'ExpressionStatement')
        return 'ExpressionStatement';
    else if (statement.type === 'VariableDeclaration')
        return 'VariableDeclaration';
    return undefined;

}

function eval_block_statement(statement_array,green) {
    let box_val = '';
    for (let i = 0; i < statement_array.length; i++) {
        let x = statement_array[i];
        let type = get_type_need_to_unit(x);
        if(type != undefined){
            while(i < statement_array.length && get_type_need_to_unit(x) != undefined){
                box_val += parse_start(x);
                i++;
                x = statement_array[i];
            }
            i--;
            let color = get_color(green);
            let next_obj_index = objects_index+1;
            objects.push(make_object(objects_index,'operation',box_val,color));
            rode.push(make_rode(objects_index,next_obj_index, undefined));
            objects_index++;
        }
        else
            box_val = parse_start(x, green);
    }
    return box_val;
}

function parse_start(code,green) {
    switch (code.type) {
    case 'Program' :
        return eval_block_statement(code.body, green);
    case 'FunctionDeclaration' :
        return eval_function_deceleration(code, green);
    case 'BlockStatement' :
        return eval_block_statement(code.body, green);
    default :
        return parsed_vars(code, green);
    }
}

const eval_array = (code)=>{
    let array_size = code.elements.length;
    let new_array = new Array(array_size);
    for(let i =0; i<array_size;i++){
        let element = eval_the_vars(code.elements[i]);
        new_array[i] = element;
    }
    new_array.toString = function() {
        return '[' + this.join() + ']';
    };
    return new_array;
};

const eval_binary = (value) =>{
    let left,operator,right;
    left = eval_the_vars(value.left);
    operator = value.operator;
    right = eval_the_vars(value.right);
    return left + ' ' + operator + ' ' + right;
};

const eval_member = (value)=>{
    let var_name = value.object.name;
    let num_in_array =eval_the_vars(value.property);
    //let variable = variable_table.find((x) => x.name === var_name);
    return var_name + '[' + num_in_array + ']';
};

const eval_the_vars = (value) => {
    switch (value.type) {
    case 'BinaryExpression':
        return eval_binary(value);
    case 'Identifier':
        return value.name;
    case 'Literal':
        return value.value;
    case  'ArrayExpression':
        return eval_array(value);
    case 'MemberExpression':
        return eval_member(value);
    }
};

const eval_variables = (param_array) => {
    let box_value='';
    for(let i =0; i< param_array.length ; i++) {
        let x = param_array[i];
        let name = x.id.name;
        let value = x.init;
        if (value != undefined) {
            value = eval_the_vars(value);
            variable_table.push({name: name, value: value});
            box_value += name + ' = ' + value + '\n';
        }
        else
            box_value += name + '\n';
    }
    return box_value;
};

const eval_variable_declaration = (code,green) => {
    let box_value = eval_variables(code.declarations,green);
    return box_value;
};

function eval_assigment_expression(expression) {
    let name = eval_the_vars(expression.left);
    let operator = expression.operator;
    let value = eval_the_vars(expression.right);
    let box_value = name + operator + value+ '\n';
    let item_index = variable_table.findIndex((x) => x.name === name);
    if (item_index >= 0)
        variable_table[item_index] = {name: name, value: value};
    else
        variable_table.push({name: name, value: value});
    return box_value;
}

function eval_update_expression(expression){
    let name = eval_the_vars(expression.argument);
    let operator = expression.operator;
    let value = eval_run_time_value(expression.right);
    let item_index = variable_table.findIndex((x) => x.name === name);
    variable_table[item_index] = {name: name, value: value};
    return name + operator;
}

function eval_expression_statement(expression,green) {
    if(expression.type === 'UpdateExpression')
        return eval_update_expression(expression,green);
    else
        return eval_assigment_expression(expression,green);
}

const parsed_vars = (code,green) => {
    switch (code.type) {
    case 'VariableDeclaration' :
        return eval_variable_declaration(code,green);
    case 'ExpressionStatement' :
        return eval_expression_statement(code.expression,green);
    default :
        return parse_loops(code,green);
    }
};

const eval_run_time_value = (test) =>{
    let to_eval = '';
    variable_table.map( (x) => {to_eval+= 'var ' + x.name + ' = ' + x.value + '; ';});
    let eval_value = to_eval + test +';';
    return eval(eval_value);
};

function eval_else_if(then_color,else_color,code){
    let save_vars = [...variable_table];
    parse_start(code.consequent, then_color);
    variable_table = [...save_vars];
    if(code.alternate != undefined) {
        parse_start(code.alternate, else_color);
        variable_table = [...save_vars];
    }
}

const eval_if_statement = (code,green) => {
    let test = eval_the_vars(code.test);
    let color = get_color(green);
    objects.push(make_object(objects_index,'condition',test,color));
    let if_index = objects_index++;
    let if_val = eval_run_time_value(test);
    if (if_val)
        eval_else_if(green,false,code);
    else
        eval_else_if(false,green,code);
    rode.push(make_rode(if_index,if_index+1,'yes'));
    rode.push(make_rode(if_index,if_index+2,'no'));
    if(code.consequent.type != 'IfStatement' && code.consequent.type != 'WhileStatement' )
        rode.push(make_rode(if_index+1,objects_index,undefined));
    else
        rode.push(make_rode(objects_index-2,objects_index,undefined));
    if(code.alternate != undefined && code.alternate.type != 'IfStatement' && code.alternate.type != 'WhileStatement' )
        rode.push(make_rode(if_index+2,objects_index,undefined));
    else
        rode.push(make_rode(objects_index-1,objects_index));
};

const eval_while_statement = (code,green) =>{
    let color = get_color(green);
    let null_index = objects_index;
    objects.push(make_object(objects_index++,'operation','NULL',color));
    rode.push(make_rode(objects_index-1,objects_index,undefined));
    let test =eval_the_vars(code.test);
    let while_index = objects_index;
    objects.push(make_object(objects_index++,'condition',test,color));
    let while_val = eval_run_time_value(test);
    if(while_val) {
        parse_start(code.body, green);
    }
    else {
        parse_start(code.body, false);
    }
    rode.push(make_rode(while_index,objects_index-1,'yes'));
    rode.push(make_rode(objects_index-1,null_index));
    rode.push(make_rode(while_index,objects_index,'no'));
};

function eval_return_statement(code,green) {
    let new_return ='return ' + eval_the_vars(code.argument);
    let color = get_color(green);
    objects.push(make_object(objects_index,'end',new_return,color));
}

const parse_loops = (code,green) => {
    switch (code.type) {
    case 'WhileStatement' :
        return eval_while_statement(code,green);
    case 'IfStatement' :
        return eval_if_statement(code,green);
    case 'ReturnStatement' :
        return eval_return_statement(code,green);
    }
};

export {parseCode};
