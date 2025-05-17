// src/features/subtables/components/CreateSubtableModal/CreateSubtableModal.jsx
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useFetcher, useNavigate} from 'react-router';

import Modal from '#shared/components/UIElement/Modal/Modal';
import Input from '#shared/components/UIElement/Input/Input';
import Button from '#shared/components/UIElement/Button/Button';
import Form from '#shared/components/UIElement/Form/Form';
import Icon from '#shared/components/UIElement/Icon/Icon';

import './CreateSubtableModal.css';

export default function CreateSubtableModal({isOpen, onClose}) {
    const fetcher = useFetcher();
    const navigate = useNavigate();
    const isSubmitting = fetcher.state === 'submitting';
    const actionData = fetcher.data;

    const [currentStep, setCurrentStep] = useState(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [subtableType, setSubtableType] = useState('public'); // Default or manage as needed
    const [isNSFW, setIsNSFW] = useState(false);
    const [message, setMessage] = useState(null);
    const [nameError, setNameError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [iconPreview, setIconPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    const nameCharacterLimit = 20;
    const descriptionCharacterLimit = 500;

    // Ref to track if the current actionData has already triggered success actions
    const processedActionDataRef = useRef(null);

    // Effect to reset modal state when it's opened or closed
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setName('');
            setDescription('');
            setSubtableType('public');
            setIsNSFW(false);
            setMessage(null); // Clear any previous success/error messages
            setNameError('');
            setDescriptionError('');

            // Revoke old Object URLs and reset previews
            if (iconPreview) URL.revokeObjectURL(iconPreview);
            setIconPreview(null);
            if (bannerPreview) URL.revokeObjectURL(bannerPreview);
            setBannerPreview(null);

            // Reset file input fields visually
            const iconInput = document.getElementById('subtable-icon-file');
            if (iconInput) iconInput.value = '';
            const bannerInput = document.getElementById('subtable-banner-file');
            if (bannerInput) bannerInput.value = '';

            processedActionDataRef.current = null; // Reset ref when modal opens

        } else {
            // Perform full cleanup when modal is closing
            setCurrentStep(1);
            setName('');
            setDescription('');
            setSubtableType('public');
            setIsNSFW(false);
            setMessage(null);
            setNameError('');
            setDescriptionError('');

            if (iconPreview) URL.revokeObjectURL(iconPreview);
            setIconPreview(null);
            if (bannerPreview) URL.revokeObjectURL(bannerPreview);
            setBannerPreview(null);

            const iconInput = document.getElementById('subtable-icon-file');
            if (iconInput) iconInput.value = '';
            const bannerInput = document.getElementById('subtable-banner-file');
            if (bannerInput) bannerInput.value = '';
            // Optionally reset ref on close as well, though resetting on open is primary
            // processedActionDataRef.current = null;
        }
    }, [isOpen]); // Only re-run if isOpen changes

    // Effect for cleaning up Object URLs for previews when iconPreview/bannerPreview change or component unmounts
    useEffect(() => {
        const currentIconPreviewUrl = iconPreview;
        const currentBannerPreviewUrl = bannerPreview;

        return () => {
            if (currentIconPreviewUrl) URL.revokeObjectURL(currentIconPreviewUrl);
            if (currentBannerPreviewUrl) URL.revokeObjectURL(currentBannerPreviewUrl);
        };
    }, [iconPreview, bannerPreview]);

    // Effect to handle data from the fetcher (actionData)
    useEffect(() => {
        // Only process if actionData exists and is different from the last processed one
        if (actionData && actionData !== processedActionDataRef.current) {
            if (actionData.success) {
                setMessage({type: 'success', text: actionData.message || 'Cộng đồng đã được tạo thành công!'});

                // Mark this actionData as processed to prevent re-triggering success actions
                processedActionDataRef.current = actionData;

                setTimeout(() => {
                    onClose(); // This will trigger the useEffect based on `isOpen` to reset state
                    const createdSubtable = actionData.subtable || actionData.data; // Prefer actionData.subtable
                    const createdNameValue = createdSubtable?.name || name.trim(); // Use actual created name or fallback
                    if (createdNameValue) {
                        navigate(`/s/${createdNameValue}`);
                    } else {
                        navigate('/'); // Fallback navigation
                    }
                }, 1500);
            } else {
                // Handle error messages from actionData
                let errorMessage = actionData.message || 'Không thể tạo cộng đồng.';
                if (actionData.field === 'name') {
                    setNameError(errorMessage);
                } else if (actionData.field === 'description') {
                    setDescriptionError(errorMessage);
                } else {
                    setMessage({type: 'danger', text: errorMessage});
                }
                // Mark this error actionData as processed as well
                processedActionDataRef.current = actionData;
            }
        }
    }, [actionData, onClose, navigate, name]);


    const handleNameChange = (e) => {
        let newName = e.target.value;
        if (newName.toLowerCase().startsWith('s/')) {
            newName = newName.substring(2);
        }
        if (newName.length <= nameCharacterLimit) {
            setName(newName);
        }
        if (message) setMessage(null);
        if (nameError) setNameError('');
        processedActionDataRef.current = null; // Reset if user types, allowing new actionData to be processed
    };

    const handleDescriptionChange = (e) => {
        const newDescription = e.target.value;
        if (newDescription.length <= descriptionCharacterLimit) {
            setDescription(newDescription);
        }
        if (descriptionError) setDescriptionError('');
        if (message) setMessage(null);
        processedActionDataRef.current = null; // Reset if user types
    };

    const handleFileChange = (e) => {
        const {name: inputName, files} = e.target;
        if (files && files[0]) {
            const file = files[0];
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validImageTypes.includes(file.type)) {
                alert('Vui lòng chọn tệp hình ảnh hợp lệ (JPEG, PNG, GIF, WEBP).');
                e.target.value = ''; // Clear the input
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Kích thước tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.');
                e.target.value = ''; // Clear the input
                return;
            }
            const fileUrl = URL.createObjectURL(file);

            if (inputName === 'iconFile') {
                if (iconPreview) URL.revokeObjectURL(iconPreview); // Revoke old URL before setting new one
                setIconPreview(fileUrl);
            } else if (inputName === 'bannerFile') {
                if (bannerPreview) URL.revokeObjectURL(bannerPreview); // Revoke old URL
                setBannerPreview(fileUrl);
            }
        } else {
            // Handle case where file selection is cancelled or cleared
            if (inputName === 'iconFile') {
                if (iconPreview) URL.revokeObjectURL(iconPreview);
                setIconPreview(null);
            } else if (inputName === 'bannerFile') {
                if (bannerPreview) URL.revokeObjectURL(bannerPreview);
                setBannerPreview(null);
            }
        }
        processedActionDataRef.current = null; // Reset if files change
    };

    const validateStep1 = useCallback(() => {
        let isValid = true;
        let currentNameError = '';
        let currentDescriptionError = '';
        let currentName = name.trim();

        if (!currentName) {
            currentNameError = 'Tên cộng đồng là bắt buộc.';
            isValid = false;
        } else if (currentName.length < 3) {
            currentNameError = 'Tên phải dài từ 3 đến 21 ký tự.';
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(currentName)) {
            currentNameError = 'Chỉ bao gồm chữ cái, số và dấu gạch dưới.';
            isValid = false;
        } else if (currentName.length > nameCharacterLimit) {
            currentNameError = `Tên không được vượt quá ${nameCharacterLimit} ký tự.`;
            isValid = false;
        }

        if (description.length > descriptionCharacterLimit) { // Description is optional, only validate length if provided
            currentDescriptionError = `Mô tả không được vượt quá ${descriptionCharacterLimit} ký tự.`;
            isValid = false; // Or just show error but allow proceeding if description is optional
        }

        setNameError(currentNameError);
        setDescriptionError(currentDescriptionError);
        return isValid;
    }, [name, description, nameCharacterLimit, descriptionCharacterLimit]);

    const handleNext = () => {
        if (validateStep1()) {
            setCurrentStep(2);
            setMessage(null); // Clear messages when moving steps
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
        setMessage(null); // Clear messages when moving steps
    };

    const handleSubmit = (event) => {
        // Clear previous messages before submitting
        setMessage(null);
        setNameError('');
        setDescriptionError('');
        processedActionDataRef.current = null; // Allow actionData to be processed for this new submission

        const isStep1DataValid = validateStep1();

        if (!isStep1DataValid && currentStep === 2) {
            // If on step 2 but step 1 data became invalid (e.g. devtools manipulation)
            setCurrentStep(1); // Force back to step 1
            event.preventDefault(); // Prevent form submission
            return;
        } else if (currentStep === 1 && !isStep1DataValid) {
            // If on step 1 and data is invalid, prevent submission
            event.preventDefault(); // Prevent form submission
            return;
        }
    };

    const renderStep1 = () => (
        <>
            <div>
                <Input
                    id="subtable-name"
                    name="name"
                    type="text"
                    label="Tên cộng đồng"
                    placeholder=" " // For floating label
                    value={name}
                    onChange={handleNameChange}
                    required
                    disabled={isSubmitting}
                    addonBefore={<Icon name="community" size="16"/>}
                    isInvalid={!!nameError}
                    feedback={nameError}
                />
                <div className="d-flex justify-content-between fs-8 mt-1">
                    <small className="text-muted">
                        Tên cộng đồng bao gồm cả viết hoa không thể thay đổi.
                    </small>
                    <small className="text-muted">
                        s/{name} • {nameCharacterLimit - name.length} ký tự còn lại
                    </small>
                </div>
            </div>
            <div className="mt-3">
                <Input
                    id="subtable-description"
                    name="description"
                    type="textarea"
                    label="Mô tả (Tùy chọn)"
                    placeholder=" "
                    value={description}
                    onChange={handleDescriptionChange}
                    disabled={isSubmitting}
                    isInvalid={!!descriptionError}
                    feedback={descriptionError}
                    rows={4}
                />
                <small className="text-muted d-block text-end fs-8 mt-1">
                    Đây là cách thành viên mới tìm hiểu về cộng đồng của bạn.
                    • {descriptionCharacterLimit - description.length} ký tự còn lại
                </small>
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
            {/* Hidden fields to carry over data from step 1 if needed by the form structure */}
            <input type="hidden" name="name" value={name}/>
            <input type="hidden" name="description" value={description}/>

            <div className="mb-4">
                <h6 className="form-label-group">Giao diện (Tùy chọn)</h6>
                <div className="border p-3 rounded mb-3">
                    <Input
                        id="subtable-icon-file"
                        name="iconFile"
                        type="file"
                        label="Biểu tượng"
                        showLabelForFile={true}
                        disabled={isSubmitting}
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        onChange={handleFileChange}
                    />
                    {iconPreview && (
                        <div className="mt-2">
                            <img
                                src={iconPreview}
                                alt="Xem trước biểu tượng"
                                className="img-fluid rounded-circle d-block mx-auto create-subtable-icon-preview"
                            />
                        </div>
                    )}
                    <small className="text-muted d-block fs-8 mt-1">Kích thước đề xuất: 256x256px. Tối đa 5MB.</small>
                </div>

                <div className="border p-3 rounded">
                    <Input
                        id="subtable-banner-file"
                        name="bannerFile"
                        type="file"
                        label="Ảnh bìa"
                        showLabelForFile={true}
                        disabled={isSubmitting}
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        onChange={handleFileChange}
                    />
                    {bannerPreview && (
                        <div className="mt-2">
                            <img
                                src={bannerPreview}
                                alt="Xem trước ảnh bìa"
                                className="img-fluid create-subtable-banner-preview"
                            />
                        </div>
                    )}
                    <small className="text-muted d-block fs-8 mt-1">Kích thước đề xuất: 1920x384px. Tối đa 5MB.</small>
                </div>
            </div>

            {/* Hidden input for subtableType if it's part of the form submission */}
            <input type="hidden" name="subtableType" value={subtableType}/>

            <div className="form-check form-switch mb-4 adult-content-switch">
                <input
                    className="form-check-input" type="checkbox" role="switch"
                    id="isNSFW" name="isNSFW" checked={isNSFW}
                    onChange={(e) => setIsNSFW(e.target.checked)}
                    disabled={isSubmitting}
                />
                <label className="form-check-label" htmlFor="isNSFW">
                    <strong>Nội dung người lớn (18+)</strong>
                </label>
            </div>
        </>
    );

    const modalFooter = (
        <div className="d-flex justify-content-between gap-2 w-100">
            <Button
                onClick={onClose}
                type="button"
                addClass="btn-outline-secondary px-4 modal-button-custom"
                disabled={isSubmitting}
            >
                Hủy
            </Button>
            <div className="d-flex gap-2">
                {currentStep === 1 && (
                    <Button
                        onClick={handleNext}
                        type="button"
                        addClass="btn-primary px-4 modal-button-custom"
                        disabled={isSubmitting || !name.trim() || !!nameError || name.trim().length < 3 || name.trim().length > nameCharacterLimit || !!descriptionError}
                    >
                        Tiếp theo
                    </Button>
                )}
                {currentStep === 2 && (
                    <>
                        <Button
                            onClick={handleBack}
                            type="button"
                            addClass="btn-outline-secondary px-4 modal-button-custom"
                            disabled={isSubmitting}
                        >
                            Quay lại
                        </Button>
                        <Button
                            type="submit" // This will trigger the Form's onSubmit, then the fetcher
                            addClass="btn-primary px-4 modal-button-custom"
                            form="create-subtable-form" // Associates button with the form
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang tạo...' : 'Tạo cộng đồng'}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <Modal
            id="create-subtable-modal"
            isOpen={isOpen}
            onClose={onClose}
            title="Tạo một cộng đồng"
            footer={modalFooter}
        >
            <Form
                id="create-subtable-form"
                method="post"
                action="/s" // Your API endpoint for creating subtables
                preventNavigation={true}
                fetcher={fetcher}
                mainClass="create-subtable-form-content"
                encType="multipart/form-data"
                onSubmit={handleSubmit}
                noValidate
            >
                {message && (
                    <div className={`alert alert-${message.type} mb-3`} role="alert">
                        {message.text}
                    </div>
                )}
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
            </Form>
        </Modal>
    );
}