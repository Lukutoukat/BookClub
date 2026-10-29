import type {BookProvider, FetchedProviderBook} from "@/services/book-providers/index.ts";

export interface TestBookRecord extends FetchedProviderBook {
    provider: 'test'
    test: true
}

export function isTestBookRecord(record: FetchedProviderBook): record is TestBookRecord {
    return "test" in record && record.test === true;
}

export const TestProvider: BookProvider<TestBookRecord> = {
    fetch: () => {
        return Promise.resolve({
            result: [{
                provider: "test",
                test: true,
                id: "meow",
            }]
        })
    }
} as const

