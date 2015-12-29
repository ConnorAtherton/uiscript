# Grammar

[ nonterminal ]

terminal

---

comment => //
[ program ] **-->** [ expression ] ...

// expressions here will usually always be variables
[ ui_declaration ] **-->** when I [ event_value ] on [ expression ] [ block ]

[ trigger_declaration ] **-->** variable [ block ]
[ expression ] --> [ selector ]
               --> [ variable ]

[ block ] **-->** then [ block_statements_list ] end
[ block_statements_list ] **-->** [ block_statements_list ] | [ block_statement ]
[ event_value ] --> click | hover | doubleclick


