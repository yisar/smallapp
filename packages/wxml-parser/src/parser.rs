use crate::lexer::{Error, Kind, Lexer, Token};

#[derive(Clone, Debug, PartialEq)]
pub struct Parser {
    pub lexer: Lexer,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Node {
    pub token: Token,
    pub children: Option<Vec<Node>>,
}

impl Parser {
    pub fn new(code: &str) -> Parser {
        Parser {
            lexer: Lexer::new(code.to_string()),
        }
    }

    pub fn parse_all(&mut self) -> Result<Node, Error> {
        self.lexer.tokenize_all()?;
        return self.read_node();
    }

    pub fn read_node(&mut self) -> Result<Node, Error> {
        return self.read_child();
    }

    pub fn read_child(&mut self) -> Result<Node, Error> {
        let current = self.read_token()?;
        let mut children = vec![];

        match &current.kind {
            Kind::OpenTag(_) => {
                loop {
                    let next = self.peek_token(0);
                    match next {
                        Ok(n) => {
                            match n.kind {
                                Kind::CloseTag(_) => {
                                    self.read_child()?;
                                    break;
                                }
                                Kind::Comment(_) => {
                                    self.read_child()?;
                                }
                                _ => {
                                    let node = self.read_child()?;
                                    children.push(node);
                                }
                            }
                        }
                        Err(_) => break,
                    }
                }
                return Ok(Node {
                    token: current,
                    children: Some(children),
                });
            }
            Kind::CloseTag(_) => {
                return Ok(Node {
                    token: current,
                    children: None,
                });
            }
            Kind::SelfCloseTag(_) => {
                return Ok(Node {
                    token: current,
                    children: None,
                });
            }
            Kind::Text(_) => {
                return Ok(Node {
                    token: current,
                    children: None,
                })
            }
            Kind::Comment(_) => {
                return self.read_child();
            }
            _ => {
                Err(Error::END)
            }
        }
    }
}

impl Parser {
    pub fn read_token(&mut self) -> Result<Token, Error> {
        if self.lexer.index < self.lexer.tokens.len() {
            let index = self.lexer.index;
            self.lexer.index += 1;
            Ok(self.lexer.tokens[index].clone())
        } else {
            Err(Error::END)
        }
    }

    pub fn peek_token(&mut self, index: usize) -> Result<Token, Error> {
        let index_in_tokens = self.lexer.index + index;
        if index_in_tokens < self.lexer.tokens.len() {
            Ok(self.lexer.tokens[index_in_tokens].clone())
        } else {
            Err(Error::END)
        }
    }
}
