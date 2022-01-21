import {
  FileText,
  Unlock,
  Feather,
  Box
} from 'react-feather'
export default [
  {
    id: 'sparklab-token',
    title: 'SparkLab Token',
    icon: <FileText />,
    children: [
      {
        id: 'live-chart',
        title: 'Live Chart',
        navLink: 'https://poocoin.app/tokens/0x683b383E9D6Cc523F4C9764daceBB5752892fc53',
        newTab: true,
        externalLink: true,
        icon: <Feather />
      },
      {
        id: 'buy-spark',
        title: 'Buy Spark',
        navLink: 'https://pancakeswap.finance/swap?outputCurrency=0x683b383E9D6Cc523F4C9764daceBB5752892fc53',
        newTab: true,
        externalLink: true,
        icon: <Box />
      },
      {
        id: 'about',
        title: 'About',
        navLink: 'https://thesparklab.io',
        newTab: true,
        externalLink: true,
        icon: <Unlock />
      }
    ]
  }
]
