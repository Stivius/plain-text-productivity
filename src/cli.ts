#! /usr/bin/env node

import main from "./index";

main().catch((err) => console.log(err, "Error while running"));
