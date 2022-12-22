export function fetchMetatags(url: string) {
    return fetch(
        `https://cors.deno.dev/https://metatags-fetcher.deno.dev/?${url}`
    ).then((r) => r.json());
}