extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

pub mod generator;
pub mod lexer;
pub mod parser;

#[wasm_bindgen]
pub fn compile(str: &str) -> String {
    let mut parser = parser::Parser::new(str);
    let res = parser.parse_all();
    match res {
        Ok(ast) => {
            let mut gen = generator::Generator::new(ast);
            let code = gen.generate_fre();
            return code;
        }
        Err(_) => return "".to_string(),
    };
}
