# Grammar

[ nonterminal ]

terminal

---

comment => // *
[ program ] **-->** [ expression ] ...

// expressions here will usually always be variables
[ ui_declaration ] **-->** when I [ expression ] on [ expression ] [ block ]

[ trigger_declaration ] **-->** variable [ block ]

[ block ] **-->** then [ block_statements_list ] end

// use statement here to avoid nested expressions
[ statement ] **-->** run [ identifier ] | [ identifier ] = [ selector ]

[ block_statements_list ] **-->** [ block_statements_list ] | [ block_statement ]


