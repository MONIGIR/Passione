import /*{useState, useEffect} form */ 'react';
import BarraLateral from './barraLateral';

//iconoso de la barra lateral
import userIcon from '../assets/user.svg';
import WrenchIcon from '../assets/wrench.svg';
import PowerIcon from '../assets/power.svg';
import PackageIcon from '../assets/package.svg';
import HouseIcon from '../assets/house.svg';
import bookOpenIcon from '../assets/book-open-text.svg';
import '../styles/BarraLateral.css';

const AdminDashboard = () =>{

/*const [datos, setDatos] = useState({
        productosSinStock: [],
        productosTopVentas: [],
        productosBajoStock: [],
        metricas:{
            totales: 0,
            enStock: 0,
            ordenesEnvio: 0,
            ganancias: 0
        }
    });*/

//useEffect(() =>{

/*const mockDatabaseData={

    productosSinStock: [
        {id:"", tipo:"Anillo" },
        {id:"", tipo:"Anillo" },
        {id:"", tipo:"Anillo" },
    ],
    productosTopVentas:[
        {id:"", tipo:"Anillo" },
        {id:"", tipo:"Anillo" },
        {id:"", tipo:"Anillo" },
        {id:"", tipo:"Anillo" },
        {id:"", tipo:"Anillo" },
    ],
    productosBajoStock: [
        {id:"", tipo:"Anillo" },
        {id:"", tipo:"Anillo" },
        {id:"", tipo:"Anillo" },
    ],
    metricas: {
        totales :"" ,
        enStock:"",
        ordenesEnvio: "",
        ganancias: "",
    }
};
    //setDatos(mockDatabaseData);
}, []); */

const Botones = [
    {
        imagen:HouseIcon,
        texto:"Inicio",
        enlace:"#"
    },
    {
        imagen:userIcon,
        texto:"Usuarios",
        enlace:"#"
    },
        {
        imagen:bookOpenIcon,
        texto:"Documentación",
        enlace:"#"
    },
    {
        imagen:WrenchIcon,
        texto:"Configuración",
        enlace:"#"
    },
    {
        imagen:PackageIcon,
        texto:"Inventario",
        enlace:"#"
    },
    {
        imagen:PowerIcon,
        texto:"Cerrar Sesión",
        enlace:"#"
    },
];
    return (
        <div className="admin-dashboard">
            <BarraLateral botones={Botones}/>
        

        </div>
    );
}

export default AdminDashboard;