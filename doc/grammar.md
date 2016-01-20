# Grammar

This grammar is written in extended Backus-Naur form.

<program> :
  <expression>

<expression> :
  <assignment>
  <trigger_declaration>

<assignment> :
  <variable> = <selector_string>

<selector> :
  <variable>
  <selector_string>

<variable> :
  @/[a-zA-Z]+/

<trigger_declaration> :
 when <natural_language> <action> <natural_language> <selector> <block>

<natural_launguage> :
  (I | on)

<block> :
  then <block_statements_list> end

<block_statements_list> :
  <block_statement> {, <block_statement>}

<block_statement> :
  <trigger> <selector> {<natural_language> <selector>}

<action> :
  (click | hover | doubleclick)




