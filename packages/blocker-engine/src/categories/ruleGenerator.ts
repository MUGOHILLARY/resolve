export function generateChromeRules(
  websites: string[]
) {

  return websites.map(
    (site, index) => ({

      id: index + 1,

      priority: 1,

      action: {
        type: "block",
      },

      condition: {

        urlFilter: `||${site}`,

        resourceTypes: [
          "main_frame",
        ],

      },

    })
  );

}