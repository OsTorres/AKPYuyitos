import React, { lazy } from 'react';
import { APP_VALUES } from '../constants/app';
import { HomeRedirect } from './RouteUtils';
const RouteController = lazy(() => import('./RouteController'));
const NotFound = lazy(() => import('../components/Pages/NotFound'));
const Login = lazy(() => import('../components/Pages/Login'));
const Home = lazy(() => import('../components/Pages/Home'));
const Dashboard = lazy(() => import('../components/Pages/Dashboard'));
const Usuarios = lazy(() => import('../components/Pages/Usuarios'));
const Proyectos = lazy(() => import('../components/Pages/Proyectos'));
const Proveedores = lazy(()=> import('../components/Pages/Proovedores'));
const Productos = lazy(()=> import('../components/Pages/Productos'));;
const Caja = lazy(()=> import('../components/Pages/Caja'));
const Rubros = lazy(()=> import('../components/Pages/Rubros'));
const Categorias = lazy(() => import('../components/Pages/Categorias'));
const UnidadMedida = lazy(()=> import('../components/Pages/UnidadMedida'));
const OrdenCompra = lazy(()=> import('../components/Pages/OrdenCompra'));
const Bodega = lazy(()=> import('../components/Pages/Bodega'));
const Marcas = lazy(()=> import('../components/Pages/Marcas'));
const Clientes = lazy(()=> import('../components/Pages/Clientes'));
const Usuario = lazy(()=> import('../components/Pages/Usuario'));
const Preventa = lazy(()=> import('../components/Pages/Preventa'));
const Ventas = lazy(()=> import('../components/Pages/Ventas'));
const Fiados = lazy(()=> import('../components/Pages/Fiados'));

const toke = true;

const routesAdmin = [
	{
		path: "/",
		exact: true,
		component: HomeRedirect
	},
	{
		path: "/login",
		exact: true,
		render: props => <Login {...props} page={'login'}/>
	},
	{
		path: "/cliente",
		exact: true,
		render: props => <Clientes {...props} />
	},
	{
		path: `/${APP_VALUES.ROOT_ROUTE}`,
		render: props => <RouteController component={Home} {...props} istoken={true}/>,
		routes: [
			{
				path: `/${APP_VALUES.ROOT_ROUTE}`,
				exact: true,
				render: props => <RouteController component={Dashboard} {...props} page={'inicio'}/>
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/usuarios`,
				exact: true,
				render: props => <RouteController component={Usuarios} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/proyectos`,
				exact: true,
				render: props => <RouteController component={Proyectos} {...props} istoken={toke}/>
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/proveedores`,
				exact: true,
				render: props => <RouteController component={Proveedores} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/productos`,
				exact: true,
				render: props => <RouteController component={Productos} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/caja`,
				exact: true,
				render: props => <RouteController component={Caja} {...props} page={'caja'} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/rubros`,
				exact: true,
				render: props => <RouteController component={Rubros} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/marcas`,
				exact: true,
				render: props => <RouteController component={Marcas} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/categorias`,
				exact: true,
				render: props => <RouteController component={Categorias} step={'categoria'} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/unidad-medida`,
				exact: true,
				render: props => <RouteController component={UnidadMedida} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/orden-compra`,
				exact: true,
				render: props => <RouteController component={OrdenCompra} step={'ordenCompra'} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/bodega`,
				exact: true,
				render: props => <RouteController component={Bodega} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/clientes`,
				exact: true,
				render: props => <RouteController component={Clientes} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/usuario`,
				exact: true,
				render: props => <RouteController component={Usuario} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/preventa`,
				exact: true,
				render: props => <RouteController component={Preventa} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/ventas`,
				exact: true,
				render: props => <RouteController component={Ventas} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/fiados`,
				exact: true,
				render: props => <RouteController component={Fiados} {...props} />
			},
			{
				path: `/${APP_VALUES.ROOT_ROUTE}/*`,
				exact: true,
				render: props => <NotFound {...props} />
			},
		]
	},
	{
		path: '*',
		render: props => <NotFound {...props} />
	}
]

export default routesAdmin