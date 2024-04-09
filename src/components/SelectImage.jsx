"use client"
import React, { useState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import ReactModal from 'react-modal';
ReactModal.setAppElement('body');// Ajusta el elemento raíz de tu aplicación

function SelectImage({ uploadedImage, setUploadedImage }) {
    const [croppedImage, setCroppedImage] = useState(uploadedImage || null);
    const [cropper, setCropper] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        event.target.value = null;
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            const imageUrl = reader.result;
            setCroppedImage(imageUrl);
            setShowModal(true);
        };

        reader.readAsDataURL(file);
    };

    const handleCrop = () => {
        if (cropper) {
            const croppedCanvas = cropper.getCroppedCanvas();
            if (croppedCanvas) {
                setCroppedImage(croppedCanvas.toDataURL());
                setUploadedImage(croppedCanvas.toDataURL())
                setShowModal(false);
            }
        }
    };

    const handleCancelCrop = () => {
        setCroppedImage(null);
        setUploadedImage('')
        setShowModal(false);
    };

    const customStyles = {
        overlay: {
            zIndex: 50 // Ajusta el zIndex del modal según sea necesario
        },
        content: {
            zIndex: 60, // Ajusta el zIndex del contenido del modal según sea necesario
            width: '50%', // Ajusta el ancho del modal
            height: "530px",
            margin: 'auto' // Centra el modal horizontalmente
        }
    };

    return (
        <div className='grid grid-cols-1 justify-items-center'>
            {croppedImage && !showModal && (
                <>
                    <img src={croppedImage} width={"200px"} alt="Imagen recortada" className='border-2 border-neutral-500 w-52' />
                </>
            )}

            {!croppedImage && (
                <>
                    <img src="/images/default/default.jpg" height={"250px"} alt="Imagen por defecto" className='border-2 border-neutral-500 w-52' />
                    <span className='pt-4 text-red-400 text-md'>You have not selected an image *</span>
                </>
            )}
            <label className='bg-neutral-800 hover:bg-neutral-700 p-4 rounded-md text-white mt-4 cursor-pointer' htmlFor="image">
                Select Image
            </label>
            <input id='image' type="file" accept="image/*" onChange={handleFileChange} className='hidden' />
            <ReactModal
                isOpen={showModal}
                onRequestClose={() => setShowModal(false)}
                contentLabel="Recortar Imagen"
                shouldCloseOnOverlayClick={false}
                style={customStyles}
            >
                {croppedImage && (
                    <div className=''>
                        <Cropper
                            src={croppedImage}
                            style={{ height: 350, width: '100%' }}
                            initialAspectRatio={1}
                            preview=".img-preview"
                            aspectRatio={4 / 5}
                            crop={() => { }}
                            viewMode={1}
                            minCropBoxHeight={10}
                            minCropBoxWidth={10}
                            background={false}
                            responsive={true}
                            autoCropArea={0.7}
                            checkOrientation={false}
                            guides={true}
                            onInitialized={(instance) => setCropper(instance)}
                        />

                        <div className="grid grid-2 gap-2 mt-4">
                            <button onClick={handleCrop} className=" bg-blue-800 hover:bg-blue-900 py-4 px-10 rounded text-white">Save</button>
                            <button onClick={handleCancelCrop} className="bg-neutral-600 hover:bg-neutral-700 py-4 px-10 rounded text-white">Cancel</button>
                        </div>
                    </div>
                )}
            </ReactModal>
        </div>

    );
}

export default SelectImage