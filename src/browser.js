import Lexer from './lexer'
import Parser from './parser'
import template from './templates/wrapper'

const uiscriptTypes = ['text/uiscript']

const initializeUiscript = () => {
  const scripts = [].slice.call(document.getElementsByTagName('script'))
    .filter(s => uiscriptTypes.includes(s.type))
   .reduce((acc, s) => `${acc}\n\n${s.innerText}`, '')

  const lexer = new Lexer(scripts)
  const parser = new Parser(lexer)

  parser.parse()

  const script = document.createElement('script')
  script.innerHTML = template(parser.ast.toString())
  document.body.appendChild(script)
}

window.addEventListener('DOMContentLoaded', initializeUiscript, false)
