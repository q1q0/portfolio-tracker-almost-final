import { lazy } from 'react'

const TablesRoutes = [
  {
    path: '/',
    component: lazy(() => import('../../views/tables/reactstrap'))
  }
]

export default TablesRoutes
