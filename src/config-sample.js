const MY_GUILD = '564353135014305241'
const MY_CHANNEL = '740320925389221136'

const mangaplus = {
  guilds: {
    [MY_GUILD]: {
      searches: [
        {
          data: {
            titleId: '100020',
            minChapterNumber: 1120,
          },
          identifier: 'my_manga',
          channel: MY_CHANNEL,
        }
      ]
    }
  }
}

export {
  mangaplus
}
