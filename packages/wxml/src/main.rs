pub mod generator;
pub mod lexer;
pub mod parser;
use std::io::Read;


fn main() {
  let mut file = std::fs::File::open("D:\\miniapp\\fre-miniapp\\packages\\demo\\pages\\index\\index.wxml").unwrap();
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();
    println!("{}", contents.replace("\n", "").replace("\r", ""));
  let mut parser = parser::Parser::new(contents.replace("\n", "").replace("\r", ""));
  let res = parser.parse_all();
  match res {
    Ok(ast) => {
      let mut gen = generator::Generator::new(ast, 0);
      let code = gen.generate_fre();
      println!("{:#?}", code)
    }
    Err(_) => {}
  }
}
