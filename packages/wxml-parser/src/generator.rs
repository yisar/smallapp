use crate::lexer::Kind;
use crate::parser::Node;
use std::collections::VecDeque;

#[derive(Clone, Debug, PartialEq)]
pub struct Generator {
    pub ast: Node,
    pub conditions: Vec<String>,
}

impl Generator {
    pub fn new(ast: Node) -> Generator {
        Generator {
            ast,
            conditions: vec![],
        }
    }

    pub fn generate_fre(&mut self) -> String {
        let root = self.ast.clone();
        return self.generate_node(root);
    }

    pub fn generate_node(&mut self, node: Node) -> String {
        let token = node.token;
        let mut directs = VecDeque::new();
        let mut code = "".to_string();

        match token.kind {
            Kind::OpenTag(name) => {
                let tag = self.camel_case(name);
                code = format!("{}<{}", code, tag);
                for attr in token.attributes.unwrap() {
                    if let Kind::Attribute(name, value) = attr.kind {
                        let prop = self.wried_prop(name);
                        let expression = self.parse_expression(value);

                        match prop.as_str() {
                            "wx:key" => code = format!("{} {}=\"{}\"", code, "key", expression),
                            "wx:if" | "wx:elseif" | "wx:else" => {
                                directs.push_back((prop, expression));
                            }
                            "wx:for" => directs.push_front((prop, expression)),
                            _ => code = format!("{} {}=\"{}\"", code, prop, expression),
                        }
                    }
                }
                code += ">";
                for child in node.children.unwrap() {
                    let str = self.generate_node(child);
                    if str == "" {
                        println!("{:#?}", self.conditions)
                    }
                    code = format!("{}{}", code, str);
                }
                code = format!("{}</{}>", code, tag);
            }
            Kind::SelfCloseTag(name) => {
                let tag = self.first_upper(name);
                code = format!("{}<{}", code, tag);
                for attr in token.attributes.unwrap() {
                    if let Kind::Attribute(name, value) = attr.kind {
                        let prop = self.wried_prop(name);
                        let expression = self.parse_expression(value);
                        match prop.as_str() {
                            "wx:key" => code = format!("{} {}=\"{}\"", code, "key", expression),
                            "wx:if" | "wx:elseif" | "wx:else" => {
                                directs.push_back((prop, expression));
                            }
                            "wx:for" => directs.push_front((prop, expression)),
                            _ => code = format!("{} {}=\"{}\"", code, prop, expression),
                        }
                    }
                }
                code += "/>";
            }
            Kind::Text(text) => {
                let expression = self.parse_expression_text(text);
                code = format!("{}{}", code, expression);
            }
            _ => {}
        };
        let c = self.generate_directs(directs, code);
        return c;
    }

    pub fn generate_directs(
        &mut self,
        directs: VecDeque<(String, String)>,
        mut code: String,
    ) -> String {
        let d = match self.conditions.last() {
            Some(d) => d.clone(),
            None => "".to_string(),
        };
        let len = directs.len();
        for direct in directs {
            match direct.0.as_str() {
                "wx:if" => {
                    if d == "" || d == "else" {
                        self.conditions.push("if".to_string());
                    }
                    code = format!("{{{}?{}:", direct.1, code);
                }
                "wx:elseif" => {
                    if d == "if" {
                        self.conditions.push("elseif".to_string());
                    }
                    code = format!("{}?{}:", direct.1, code);
                }
                "wx:else" => {
                    if d == "if" || d == "elseif" {
                        self.conditions.push("else".to_string());
                    }
                    println!("{:#?}", direct.1);
                    code = format!("{}?{}:null}}", direct.1, code);
                }
                "wx:for" => {
                    code = format!("{{{}.map((item)=>{})}}", direct.1, code);
                    if len > 0 {
                        code = format!("<>{}</>", code)
                    }
                }
                _ => {}
            }
        }
        return code;
    }
}

impl Generator {
    fn first_upper(&mut self, s: String) -> String {
        let mut c = s.chars();
        match c.next() {
            None => String::new(),
            Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
        }
    }

    fn wried_prop(&mut self, p: String) -> String {
        if p.starts_with("bind") {
            let n = p.replace("bind", "");
            return format!(
                "on{}",
                match n.as_str() {
                    "tap" => "click".to_string(),
                    "confirm" => "keydown".to_string(),
                    _ => n,
                }
            );
        } else {
            p
        }
    }

    fn camel_case(&mut self, s: String) -> String {
        let arr: Vec<&str> = s.split("-").collect();
        let mut out = "".to_string();
        for s in arr {
            out = format!("{}{}", out, self.first_upper(s.to_string()));
        }
        out
    }

    fn parse_expression(&mut self, e: String) -> String {
        // todo expression parser
        return e.replace("{{", "").replace("}}", "");
    }

    fn parse_expression_text(&mut self, e: String) -> String {
        // todo expression parser
        let mut out = "".to_string();
        let mut once = true;
        let text = e.replace("{{", "{").replace("}}", "}").replace("\n", "");
        for s in text.chars() { // remove repeat \s
            if s == ' ' {
                if once == true {
                    once = false;
                    out.push(s);
                }
            } else {
                once = true;
                out.push(s)
            }
        }
        return out;
    }
}
