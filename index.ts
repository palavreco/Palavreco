import PalavrecoClient from "./src/PalavrecoClient";
import { PalavrecoConfig, PalavrecoOptions } from "./src/utils/PalavrecoConfig";

const client = new PalavrecoClient({
    intents: PalavrecoConfig.intents,
});

client.start({
    commands: client.commands,
    token: PalavrecoOptions.token,
});
