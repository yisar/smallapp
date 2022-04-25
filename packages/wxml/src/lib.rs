use std::io::Read;
pub mod generator;
pub mod lexer;
pub mod parser;

extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn generate(str: String, assetid: usize) -> String {
    let mut parser = parser::Parser::new(str);
    let res = parser.parse_all();
    match res {
        Ok(ast) => {
            let mut gen = generator::Generator::new(ast, assetid);
            let code = gen.generate_fre();
            return code;
        }
        Err(_) => return "".to_string(),
    };
}

#[wasm_bindgen]
pub fn compile(path: &str, assetid: usize) -> String {
    let mut file = std::fs::File::open(path).unwrap();
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();
    return generate(contents, assetid);
}
