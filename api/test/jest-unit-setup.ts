import { Collection } from "@mikro-orm/core";

function stubCollectionAddForUnitTests(): void {
  (Collection.prototype as unknown as Record<string, unknown>).add =
    function () {};
}

stubCollectionAddForUnitTests();
