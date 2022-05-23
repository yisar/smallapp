use std::io::Read;
pub mod generator;
pub mod lexer;
pub mod parser;

extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn generate(str: &str, assetid: usize) -> String {
    let mut parser = parser::Parser::new(str.replace("\n", "").replace("\r", ""));
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
pub fn compile(input: &str, assetid: usize) -> String {
    // let mut file = std::fs::File::open("D:\\miniapp\\fre-miniapp\\packages\\demo\\pages\\index\\index.wxml").unwrap();
    // let mut contents = String::new();
    // file.read_to_string(&mut contents).unwrap();
    return generate(input, assetid);
}
