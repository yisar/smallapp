pub mod generator;
pub mod lexer;
pub mod parser;

fn main() {
  let mut parser = parser::Parser::new(
    "<view wx:for=\"{{list}}\">
    hello {{item}}!
    <text wx:if=\"{{a}}\">a</text>
    <text wx:elseif=\"{{b}}\">b</text>
    <text wx:else />
</view>",
  );
  let res = parser.parse_all();
  match res {
    Ok(ast) => {
      let mut gen = generator::Generator::new(ast);
      let code = gen.generate_fre();
      println!("{:#?}", code)
    }
    Err(_) => {}
  }
}
