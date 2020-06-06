import React,{useEffect, useState ,ChangeEvent,FormEvent} from 'react'
import './styles.css';
import logo from '../../assets/logo.svg'
import { Link ,useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import api from '../../services/api';
import { LeafletMouseEvent} from 'leaflet';
import { Map , TileLayer , Marker} from 'react-leaflet'



interface Item{
    id:number,
    image_url:string,
    title:string,
}

interface IBGEuf{
    sigla:string,
}

interface IBGEcity{
    nome:string,
}

const CreatePoint = () =>{
    const [items,setItems] = useState<Item[]>([]);
    const [ufs,setUfs] = useState<string[]>([]);
    const [selectedUF,setSelectedUF] = useState('0');
    const [selectedCity,setSelectedCity] = useState('0');
    const [cidades,setCidades] = useState<string[]>([]);
    const [selectedPosition ,setSelectedPosition] = useState<[number,number]>([0,0])
    const [initialPosition ,setInitialPosition] = useState<[number,number]>([0,0])
    const [selectedItem,setSelectedItem] = useState<number[]>([]);

    const [formData,setFormData]=useState({
        name:"",
        email:"",
        whatsapp:"",
    });
    
    const history = useHistory();
    useEffect(()=>{
        navigator.geolocation.getCurrentPosition(position =>{
            const {latitude, longitude} = position.coords;
        
            setInitialPosition([latitude,longitude]);
        })
    })
    
    useEffect(()=>{
        api.get('items').then(response =>{
            setItems(response.data);
        });
    },[]);
    
    useEffect(()=>{
        api.get<IBGEuf[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response =>{
            const ufInitials = response.data.map(uf=>uf.sigla)


            setUfs(ufInitials);
        });
    },[]);
    
       
    useEffect(()=>{
        api.get<IBGEcity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response =>{
            const citys = response.data.map(city => city.nome);


            setCidades(citys);
            console.log(citys);
        });
    },[selectedUF]);


    function handleSubmitUF(event: ChangeEvent<HTMLSelectElement>){
        const value = event.target.value;
    
        setSelectedUF(value);
    }
    function handleSubmitCity(event: ChangeEvent<HTMLSelectElement>){
        const value = event.target.value;
    
        setSelectedCity(value);
    }
    
    function selectMap(event:LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ]);
    }


    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;

        setFormData({...formData,[name]:value});

    }

    function handleselectItem(id:number){
        const alreadySelected = selectedItem.findIndex(item => item === id );
    
        if(alreadySelected >= 0){
            const filteredItems = selectedItem.filter(item => item !==id);
            
            setSelectedItem(filteredItems);
        }else{
            setSelectedItem([...selectedItem,id])
        }
    }

    async function handleSubmit(event:FormEvent){
        event.preventDefault();
        const {name,email,whatsapp} = formData;

        const uf = selectedUF;
        const city = selectedCity;
        const [latitude,longitude] = selectedPosition;
        const items = selectedItem;

        const data={
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items,
        }

        await api.post('points',data);

        alert('ponto de coleta criado')
        
        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para Home
                </Link>
            </header>


            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> Ponto de Coleta</h1>
            
            
            <fieldset>
                <legend>
                    <h2>Dados</h2>
                </legend>

                <div className="field">
                    <label htmlFor="name">nome da entidade</label>
                    <input 
                    type="text" 
                    name="name"
                    id="name"
                    onChange={handleInputChange}
                    />
                </div>

                <div className="field-group">
                <div className="field">
                    <label htmlFor="email">E=mail</label>
                    <input 
                    type="email" 
                    name="email"
                    id="email"
                    onChange={handleInputChange}
                    />
                </div>
                <div className="field">
                    <label htmlFor="whatsapp">whatsapp</label>
                    <input 
                    type="text" 
                    name="whatsapp"
                    id="whatsapp"
                    onChange={handleInputChange}
                    />
                </div>


                </div>
            </fieldset>
            
            <fieldset>
                <legend>
                    <h2>Endereço</h2>
                    <span>Selecione seu Endereço</span>
                </legend>

        <Map center={initialPosition} zoom={15} onClick={selectMap}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={selectedPosition}/>
      </Map>

                <div className="field-group">
                    <div className="field">
                        <label htmlFor="uf">Selecione o Estado(UF)</label>
                        <select name="uf" id="uf" value={selectedUF} onChange={handleSubmitUF}>
                            <option value="0">Selecione um uf</option>
                        {ufs.map(uf =>(
                            <option key={uf} value={uf}>{uf}</option>
                        ))}
                        </select>
                    </div>
                    <div className="field">
                        <label htmlFor="city">Selecione a Cidade</label>
                        <select name="city" value={selectedCity} id="city" onChange={handleSubmitCity}>
                            <option value="0">Selecione um cidade</option>
                            {cidades.map(city =>(
                            <option key={city} value={city}>{city}</option>
                        ))}
                        </select>
                    </div>
                </div>

            </fieldset>
            
            <fieldset>
                <legend>
                    <h2>ítens de Coleta</h2>
                    <span>Selecione um ou mais itens abaixo</span>
                </legend>

                <ul className="items-grid">
                    {items.map(item=>(
                        <li key={item.id} 
                        onClick={()=>handleselectItem(item.id)}
                        className={selectedItem.includes(item.id)?'selected':""}
                        >
                        <img src={item.image_url} alt={item.title}/>
                    <span>{item.title}</span>
                    </li>
                    ))}
                
                </ul>
            </fieldset>
            <button type="submit">
                Cadastrar novo Ponto de Coleta
            </button>
            </form>
        </div>   
    );
}

export default CreatePoint;


/*
 useEffect(()=>{},[counter]);
 Vai ser carreagada sempre que counter mudar de valor
*/