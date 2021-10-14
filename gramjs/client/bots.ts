import type { EntityLike } from "../define.d.ts";
import { Api } from "../tl/mod.ts";
import { InlineResults } from "../tl/custom/inlineResults.ts";
import GetInlineBotResults = Api.messages.GetInlineBotResults;
import type { TelegramClient } from "./TelegramClient.ts";

// BotMethods
/** @hidden */
export async function inlineQuery(
    client: TelegramClient,
    bot: EntityLike,
    query: string,
    entity?: Api.InputPeerSelf,
    offset?: string,
    geoPoint?: Api.GeoPoint
): Promise<InlineResults> {
    bot = await client.getInputEntity(bot);
    let peer = new Api.InputPeerSelf();
    if (entity) {
        peer = await client.getInputEntity(entity);
    }
    const result = await client.invoke(
        new GetInlineBotResults({
            bot: bot,
            peer: peer,
            query: query,
            offset: offset || "",
            geoPoint: geoPoint,
        })
    );
    return new InlineResults(client, result, entity ? peer : undefined);
}
