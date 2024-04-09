import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider';
import DefaultTemplate from '../template/DefaultTemplate';
import TableTanstack from "../components/TableTanstack.jsx";
import { API_URL } from "../auth/constants.jsx";
import { differenceInYears } from 'date-fns';
import { FaMoneyBillWave, FaPlus, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { toast } from 'react-toastify';
import SelectImage from "../components/SelectImage";

function Products() {

    const auth = useAuth()
    //Con este estado manejamos si se creo un nuevo invoice 
    const [invoiceCreated, setInvoiceCreated] = useState(false)

    //Aquí se carga la lista de clientes, productos y los invoices enviando las solicitudes a la API
    useEffect(() => {

        //A veces las cargas de los servidores son inesperadas y puede generar errores
        //cierra los modales la primera vez de recarga 
        isOpenNewInvoiceModal ? toggleNewInvoiceModal() : null
        isOpenVoucherModal ? toggleVoucherModal() : null
        isOpenProductDetailsModal ? toggleProductDetailsModal() : null

        const fetchData = async () => {
            const endpoints = [`${API_URL}/client`, `${API_URL}/product`, `${API_URL}/invoice`];

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${auth.getRefreshToken()}`
                        }
                    });

                    if (response.ok) {
                        const json = await response.json();
                        switch (endpoint) {
                            case `${API_URL}/client`:
                                setClientList(json.user);
                                break;
                            case `${API_URL}/product`:
                                setOriginalProductList(json.product);
                                setTempProductList(json.product)
                                break;
                            case `${API_URL}/invoice`:
                                setInvoiceList(json.invoice);
                                break;
                            default:
                                break;
                        }
                    } else {
                        console.error(`Error al obtener datos de ${endpoint}`);
                    }
                } catch (error) {
                    console.error(`Error en la solicitud a ${endpoint}:`, error);
                }
            }
        };
        fetchData();
        setInvoiceCreated(false)
    }, [invoiceCreated]);

    //Estado del Invoice seleccionado
    const [selectInvoice, setSelectInvoice] = useState(null);


    const [isOpenNewInvoiceModal, setIsOpenNewInvoiceModal] = useState(false);
    const [isOpenVoucherModal, setIsOpenVoucherModal] = useState(false);
    const [isOpenProductDetailsModal, setIsOpenProductDetailsModal] = useState(false);

    //Aquí se refrescará los datos que se mostrará en ProductDetailsModal o VoucherModal
    useEffect(() => {
        if (selectInvoice) {
            if (isOpenVoucherModal) {
                const fetchData = async () => {
                    try {
                        const response = await fetch(`${API_URL}/invoice/voucher-details`, {
                            method: "POST",
                            body: JSON.stringify({ invoice_pk: selectInvoice }),
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${auth.getRefreshToken()}`
                            }
                        });

                        if (response.ok) {
                            const blob = await response.blob(); // Obtener el cuerpo de la respuesta como un Blob
                            const imageUrl = URL.createObjectURL(blob);
                            setImageSrc(imageUrl);
                        } else {
                            console.error(`Error al obtener datos`);
                            setImageSrc("");
                        }
                    } catch (error) {
                        console.error(`Error en la solicitud:`, error);
                    }
                };

                fetchData();
            }
            else if (isOpenProductDetailsModal) {

                const fetchData = async () => {
                    try {
                        const response = await fetch(`${API_URL}/invoice/products-details`, {
                            method: "POST",
                            body: JSON.stringify({ invoice_pk: selectInvoice }),
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${auth.getRefreshToken()}`
                            }
                        })

                        if (response.ok) {
                            const json = await response.json();
                            setProductDetailsList(json.products_details)
                            return
                        }
                        else {
                            console.error(`Error al obtener datos`);
                            setProductDetailsList([])
                        }
                    }
                    catch (error) {
                        console.error(`Error en la solicitud:`, error);
                    }
                }
                fetchData()
            }
        }
    }, [selectInvoice, isOpenVoucherModal, isOpenProductDetailsModal])

    const [imageSrc, setImageSrc] = useState('');
    const [uploadedImage, setUploadedImage] = useState('');

    // Validar la imagen cada vez que cambia
    useEffect(() => {
        setDataNewInvoiceModal({
            ...dataNewInvoiceModal, 
            uploadedImage,
        });

    }, [uploadedImage]);

    
    const toggleNewInvoiceModal = () => {
        setIsOpenNewInvoiceModal(!isOpenNewInvoiceModal);
        !isOpenNewInvoiceModal ? document.body.style.overflow = 'hidden' : document.body.style.overflow = 'auto'
        !isOpenNewInvoiceModal ? setTempProductList(originalProductList) : null
        setSelectedProducts([]);
        setAffiliationDate("")
        setDiscount(0)
        setQuantityInput(1)
        setSubTotal(0);
        setTotal(0);
        setUploadedImage("")

        //reset data del form NewInvoicemodal
        setDataNewInvoiceModal({
            date: '',
            client_pk: '',
            uploadedImage: ''
        })
    };

    //Cambio de estados modals
    const toggleVoucherModal = () => {
        setImageSrc("");
        setIsOpenVoucherModal(!isOpenVoucherModal);
        !isOpenVoucherModal ? document.body.style.overflow = 'hidden' : document.body.style.overflow = 'auto'
    };

    const toggleProductDetailsModal = () => {
        setProductDetailsList([])
        setIsOpenProductDetailsModal(!isOpenProductDetailsModal);
        !isOpenProductDetailsModal ? document.body.style.overflow = 'hidden' : document.body.style.overflow = 'auto'
    };

    //Aquí se encuentra la lista de los usuario
    const [clientList, setClientList] = useState([]);

    //Aquí se encuentra la lista de los productos
    const [originalProductList, setOriginalProductList] = useState([]);

    //Aquí se encuentra la lista de los productos temporales -> deibo a la funcionalidad
    // del form modal new product, ya que debe quitar objetos a medida que se vaya añadiendo al selectedproducs
    const [tempProductList, setTempProductList] = useState([]);

    // Estado para los productos seleccionados
    const [selectedProducts, setSelectedProducts] = useState([]);

    //Aquí se encuentra la lista de los invoice -> es decir, los datos que renderiza la tabla invoice
    const [invoiceList, setInvoiceList] = useState([]);

    //Aquí se encuentra los product-details
    const [productDetailsList, setProductDetailsList] = useState([]);

    const [dataNewInvoiceModal, setDataNewInvoiceModal] = useState({
        date: '',
        client_pk: '',
        uploadedImage: ''
    })

    // Estado para el subtotal
    const [subTotal, setSubTotal] = useState(0);

    // Estado para el total
    const [total, setTotal] = useState(0);

    // Estado para el discount
    const [discount, setDiscount] = useState(0);

    // Estado para el affiliation_date
    const [affiliationDate, setAffiliationDate] = useState("");

    // Estado del form de NewProductMoadal
    const [formIncomplete, setFormIncomplete] = useState(true);

    // Estado para la cantidad ingresada manualmente
    const [quantityInput, setQuantityInput] = useState(1);

    // Función para incrementar la cantidad
    const incrementQuantity = () => {
        setQuantityInput(quantityInput + 1);
    };

    // Función para decrementar la cantidad
    const decrementQuantity = () => {
        setQuantityInput(quantityInput - 1);
    };

    //para hacer los calculos de total y subtotal
    useEffect(() => {
        calculateSubTotal()
    }, [selectedProducts])

    useEffect(() => {
        calculateDiscount()
        calculateTotal()
    }, [subTotal, discount])


    useEffect(() => {
        calculateDiscount()
    }, [affiliationDate, selectedProducts, dataNewInvoiceModal])


    //Si llegan a cambiar por X razón menor a cero, establecer a 1
    useEffect(() => {
        setQuantityInput(quantityInput <= 0 ? 1 : quantityInput)
    }, [quantityInput])

    //Para hacer control si los campos del forma están vacíos
    useEffect(() => {
        for (const field in dataNewInvoiceModal) {

            if (dataNewInvoiceModal[field] === '') {

                setFormIncomplete(true)
                return
            }

        }
        if (selectedProducts.length === 0) {
            setFormIncomplete(true)
            return
        }
        setFormIncomplete(false)
    }, [selectedProducts, dataNewInvoiceModal])

    // Función para calcular el precio total de los productos seleccionados
    const calculateSubTotal = () => {
        const operation = selectedProducts.reduce((accumulator, product) => {
            return accumulator + (product.price * product.quantity);
        }, 0);
        setSubTotal(operation);
    };

    // con esto calcularemos el descuento
    const calculateDiscount = () => {

        const currentDate = new Date();
        var dfb = ""
        //difference between years
        if (affiliationDate) {
            dfb = differenceInYears(currentDate, affiliationDate);
        }

        if (subTotal >= 200 && subTotal <= 2000 && affiliationDate) {
            setDiscount(10)
        }
        else if (subTotal > 2000 && dfb <= 3 && affiliationDate) {
            setDiscount(45)
        }
        else if (subTotal > 2000 && dfb > 3 && affiliationDate) {
            setDiscount(30)
        }
        else {
            setDiscount(0)
        }
    }

    // Función para calcular el precio total de los productos seleccionados
    const calculateTotal = () => {
        const operation = ((discount / 100) * subTotal).toFixed(1)
        setTotal(subTotal - operation);
    };


    const handleChangeSelect = (event) => {
        // Extraemos el nombre del campo y el valor seleccionado del evento
        const { name, value } = event.target;
        if (value && value !== "Select ...") {
            // Actualizamos el estado 'formData' con el nuevo valor del campo
            setDataNewInvoiceModal({
                ...dataNewInvoiceModal, // Mantenemos los valores actuales de los otros campos del formulario
                [name]: value, // Actualizamos el campo correspondiente con el nuevo valor
            });

            if (name === "client_pk") {
                // Acceder al atributo data-client del elemento seleccionado
                const client_affiliation_date = event.target.selectedOptions[0].getAttribute('data-client');
                const datePart = client_affiliation_date.split('T')[0];
                setAffiliationDate(client_affiliation_date)
            }

        } else {
            // Aquí puedes manejar el caso donde el usuario no ha seleccionado un producto válido
            console.log("Por favor, seleccione una opción válida");
        }
    };

    // Función para manejar la adición de productos seleccionados
    const handleAddProduct = () => {
        const select = document.getElementById('product');
        const selectedOption = select.options[select.selectedIndex];

        if (selectedOption.value && selectedOption.value !== "Select ..." && selectedOption.value !== "There are no products") {
            const selectedProduct = JSON.parse(selectedOption.value);
            const productIndex = tempProductList.findIndex(product => product.product_pk === selectedProduct.product_pk);

            if (productIndex !== -1) {
                const updatedProductList = [...tempProductList];
                const newSelectedProduct = { ...selectedProduct, quantity: quantityInput };
                setSelectedProducts([...selectedProducts, newSelectedProduct]);
                setTempProductList(updatedProductList.filter(product => product.product_pk !== selectedProduct.product_pk));
                setQuantityInput(1);
            }
        } else {
            // Aquí puedes manejar el caso donde el usuario no ha seleccionado un producto válido
            console.log("Por favor, seleccione un producto válido.");
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault(); // Evita que el formulario se envíe de forma convencional
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/invoice/create-invoice`, {
                    method: "POST",
                    body: JSON.stringify({
                        other_data: dataNewInvoiceModal,
                        products_data: selectedProducts,
                        subTotal,
                        total,
                        discount
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.getRefreshToken()}`
                    }
                })

                if (response.ok) {
                    setInvoiceCreated(true)
                    toggleNewInvoiceModal()
                    toast.success('¡Invoice created successfully!');
                    return
                }
                else {
                    console.error(`Error al realizar la solicitud`);
                }
            }
            catch (error) {
                console.error(`Error en la solicitud:`, error);
            }
        }
        fetchData()
    }
    return (
        <DefaultTemplate>
            <main className='pt-2'>
                {isOpenNewInvoiceModal && (
                    <section>
                        <div tabIndex="-1" aria-hidden="true" className="fixed inset-0 flex items-center justify-center z-40 overflow-y-auto">
                            <div className="fixed inset-0 bg-black opacity-70"></div>
                            <div className="relative p-4 w-full max-w-5xl max-h-full">
                                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                    <div className="flex items-center justify-between mx-7 p-4 md:p-5  rounded-t dark:border-gray-600">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Add new invoice
                                        </h3>
                                        <button onClick={toggleNewInvoiceModal} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                            </svg>
                                            <span className="sr-only" >Close modal</span>
                                        </button>
                                    </div>
                                    {/* <!-- Modal body --> */}
                                    <form onSubmit={onSubmit} className="p-4 md:p-5 grid gap-5 grid-cols-3 w-full border-t">
                                        <div className='md:col-span-2 col-span-3  md:border-r md:border-gray-300 px-7'>
                                            <div className="grid gap-4 grid-cols-2 mb-5">
                                                <div className="col-span-2 sm:col-span-1">
                                                    <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date <span className='text-red-500'>*</span></label>
                                                    <input onChange={handleChangeSelect} defaultValue={dataNewInvoiceModal.date} type="date" name="date" id="date" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required="" />
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <label htmlFor="client" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Client <span className='text-red-500'>*</span></label>
                                                    <select onChange={handleChangeSelect} value={dataNewInvoiceModal.client_pk} id="client" name='client_pk' className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                                        {clientList.length !== 0 && (
                                                            <option defaultValue>Select ...</option>
                                                        )}

                                                        {clientList.length === 0 ? (
                                                            <option defaultValue>There are no clients</option>
                                                        ) : (
                                                            clientList.map(client => (
                                                                <option key={client.client_pk} value={client.client_pk} data-client={client.affiliation_date}>
                                                                    {client.name}
                                                                </option>
                                                            ))
                                                        )}
                                                    </select>
                                                </div>

                                                <div className="col-span-2 sm:col-span-1">
                                                    <label htmlFor="product" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Product <span className='text-red-500'>*</span></label>
                                                    <div className='flex gap-2'>
                                                        <select id="product" name='product' className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" disabled={tempProductList.length === 0 ? true : false}
                                                        >
                                                            {tempProductList.length !== 0 && (
                                                                <option defaultValue>Select ...</option>
                                                            )}

                                                            {tempProductList.length === 0 ? (
                                                                <option defaultValue>There are no products</option>
                                                            ) : (
                                                                tempProductList.map(product => (
                                                                    <option key={product.product_pk} value={JSON.stringify(product)}>
                                                                        {product.name}
                                                                    </option>
                                                                ))
                                                            )}
                                                        </select>
                                                        <button type='button' className='bg-neutral-800 hover:bg-neutral-700 disabled:bg-gray-200 px-2 rounded-md' onClick={() => handleAddProduct()} disabled={tempProductList.length === 0 ? true : false}><FaPlus className='text-white' /></button>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Quantity</label>

                                                    {tempProductList.length === 0 ? (
                                                        <p className='text-sm mt-5 text-gray-600 underline'>No products availables</p>
                                                    ) : (
                                                        <div className=' flex flex-col items-center '>
                                                            <div className='grid grid-cols-3 gap-1'>
                                                                <button className='bg-neutral-800 hover:bg-neutral-700 disabled:bg-gray-200 rounded-md py-2.5 flex items-center justify-center' type='button' onClick={decrementQuantity} disabled={quantityInput === 1 ? true : false}><FaCaretLeft className='text-white' /></button>
                                                                <input
                                                                    className='border text-center py-2.5'
                                                                    type="text"
                                                                    value={quantityInput}
                                                                    disabled
                                                                />
                                                                <button className='bg-neutral-800 hover:bg-neutral-700 rounded-md flex items-center justify-center py-2.5' type='button' onClick={incrementQuantity}><FaCaretRight className='text-white' /></button>
                                                            </div>
                                                        </div>


                                                    )}
                                                </div>
                                            </div>

                                            <div className="max-h-40 overflow-y-auto border border-gray-300">
                                                <div className="overflow-x-auto w-full">
                                                    <table className="w-full text-center">
                                                        <thead>
                                                            <tr>
                                                                <th scope="col" className="px-6 py-4 bg-gray-50 font-medium text-gray-500 uppercase tracking-wider">
                                                                    Product ID
                                                                </th>
                                                                <th scope="col" className="px-6  py-4 bg-gray-50 font-medium text-gray-500 uppercase tracking-wider">
                                                                    Quantity
                                                                </th>
                                                                <th scope="col" className="px-6  py-4 bg-gray-50 font-medium text-gray-500 uppercase tracking-wider">
                                                                    Product Name
                                                                </th>

                                                            </tr>
                                                        </thead>
                                                        <tbody className="h-32 bg-white divide-y divide-gray-200">

                                                            {selectedProducts.length === 0 ? (
                                                                <tr className="text-neutral-800 border-b">
                                                                    <td className="px-6 text-center" colSpan={3}>
                                                                        You have not selected any product
                                                                    </td>

                                                                </tr>
                                                            ) : (
                                                                selectedProducts.map(product => (
                                                                    <tr key={product.product_pk} className="bg-white border dark:bg-gray-800 dark:border-gray-700">
                                                                        <td scope="row" className="px-6 py-1 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                            {product.product_pk}
                                                                        </td>
                                                                        <td className="px-6 py-1">
                                                                            {product.quantity}
                                                                        </td>
                                                                        <td className="px-6 py-1">
                                                                            <div className='flex items-center justify-center'>
                                                                                {product.name} <span title={`Price per unit: $${product.price}`}><FaMoneyBillWave className='text-green-700 ml-4 cursor-pointer' size={20} /></span>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div className='bg-neutral-800 mt-4 mb-4 grid grid-cols-3 text-center'>
                                                <div className='col-span-1 border py-4'>
                                                    <span className='text-orange-500 font-medium'>SubTotal:</span> <span className='text-white'>${subTotal.toFixed(1)}</span>
                                                </div>
                                                <div className='col-span-1 border py-4'>
                                                    <span className='text-orange-500 font-medium'>Dto:</span> <span className='text-white'>${((discount / 100) * subTotal).toFixed(1)} ({discount})%</span>
                                                </div>
                                                <div className='col-span-1 border py-4'>
                                                    <span className='text-green-500 font-medium'>Total:</span> <span className='text-white'>${total.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className='flex justify-self-start gap-4 pt-6'>
                                                <button type='submit' className="text-white inline-flex items-center bg-blue-800 hover:bg-blue-900 disabled:bg-slate-200 disabled:text-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-10 py-2.5 text-center"
                                                    disabled={formIncomplete}>
                                                    Add
                                                </button>

                                                <button onClick={toggleNewInvoiceModal} className="text-white inline-flex items-center bg-neutral-600 hover:bg-neutral-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-9 py-2.5 text-center">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                        <div className='md:col-span-1 col-span-3 md:order-last order-first px-7 border-b border-gray-300 pb-7 md:border-none'>
                                            <SelectImage uploadedImage={uploadedImage} setUploadedImage={setUploadedImage} />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
                {isOpenVoucherModal && (
                    <section>
                        <div tabIndex="-1" aria-hidden="true" className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="fixed inset-0 bg-black opacity-70"></div>
                            <div className="relative p-4 w-full max-w-xl max-h-3/4">
                                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white flex-grow text-center">
                                            Voucher #{selectInvoice}
                                        </h1>
                                        <button onClick={toggleVoucherModal} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                            </svg>
                                            <span className="sr-only">Close modal</span>
                                        </button>
                                    </div>
                                    {/* <!-- Modal body --> */}
                                    <div className='p-4 flex items-center justify-center '>
                                        <div>
                                            {imageSrc && <img src={imageSrc} alt="image of invoice selected" />}
                                            {!imageSrc && <span>Loading ...</span>}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {isOpenProductDetailsModal && (
                    <section>
                        <div tabIndex="-1" aria-hidden="true" className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="fixed inset-0 bg-black opacity-70"></div>
                            <div className="relative p-4 max-w-screen-md w-full max-h-full">
                                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white flex-grow text-center">
                                            Products #{selectInvoice}
                                        </h1>
                                        <button onClick={toggleProductDetailsModal} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                            </svg>
                                            <span className="sr-only">Close modal</span>
                                        </button>
                                    </div>
                                    {/* <!-- Modal body --> */}
                                    <div className="max-h-54 overflow-y-auto border-gray-300 rounded-lg">
                                        <div className="overflow-x-auto w-full">
                                            <table className="w-full text-center">
                                                <thead>
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 bg-gray-50 font-medium text-gray-500 uppercase tracking-wider">
                                                            Product ID
                                                        </th>
                                                        <th scope="col" className="px-6  py-3 bg-gray-50 font-medium text-gray-500 uppercase tracking-wider">
                                                            Quantity
                                                        </th>
                                                        <th scope="col" className="px-6  py-3 bg-gray-50 font-medium text-gray-500 uppercase tracking-wider">
                                                            Product Name
                                                        </th>

                                                    </tr>
                                                </thead>
                                                <tbody className="h-48 bg-white divide-y divide-gray-200">

                                                    {productDetailsList.length === 0 ? (
                                                        <tr className="bg-white border-b">
                                                            <td className="px-6 text-center text-neutral-800" colSpan={3}>
                                                                There are not products
                                                            </td>

                                                        </tr>
                                                    ) : (
                                                        productDetailsList.map(product => (
                                                            <tr key={product.product_pk} className="bg-white border dark:bg-gray-800 dark:border-gray-700">
                                                                <td scope="row" className="px-6 py-1 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                                    {product.product_pk}
                                                                </td>
                                                                <td className="px-6 py-1">
                                                                    {product.quantity}
                                                                </td>
                                                                <td className="px-6 py-1 ">
                                                                    <div className='flex items-center justify-center'>
                                                                        {product.name} <span title={`Price per unit: $${product.price}`}><FaMoneyBillWave className='text-green-700 ml-4 cursor-pointer' size={20} /></span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {auth.getUser().role === 1 && (
                    <section className='mb-3'>
                        <button onClick={toggleNewInvoiceModal} className='px-6 py-3 bg-neutral-800 font-medium hover:bg-neutral-700 text-white rounded-md flex items-center' type="button"><FaPlus className='mr-3' /> Add Inovoice</button>
                    </section>
                )}
                <section>
                    <TableTanstack invoices={invoiceList} isOpenVoucherModal={isOpenVoucherModal} setIsOpenVoucherModal={setIsOpenVoucherModal}
                        isOpenProductDetailsModal={isOpenProductDetailsModal} setIsOpenProductDetailsModal={setIsOpenProductDetailsModal} setSelectInvoice={setSelectInvoice} />
                </section>
            </main>
        </DefaultTemplate>
    )
}

export default Products