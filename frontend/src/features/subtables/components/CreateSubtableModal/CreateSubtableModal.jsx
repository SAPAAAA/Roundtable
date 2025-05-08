// src/features/subtables/components/CreateSubtableModal/CreateSubtableModal.jsx
import React, {useCallback, useEffect, useState} from 'react';
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
    const [subtableType, setSubtableType] = useState('public'); // Retained for hidden input
    const [isNSFW, setIsNSFW] = useState(false);
    const [message, setMessage] = useState(null);
    const [nameError, setNameError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');

    const nameCharacterLimit = 20;
    const descriptionCharacterLimit = 500;

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setName('');
            setDescription('');
            setSubtableType('public');
            setIsNSFW(false);
            setMessage(null);
            setNameError('');
            setDescriptionError('');
            if (fetcher.data) {
                fetcher.data = null;
            }
        }
    }, [isOpen, fetcher]);

    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                setMessage({type: 'success', text: actionData.message || 'Community created successfully!'});
                setTimeout(() => {
                    onClose();
                    const createdSubtable = actionData.subtable || actionData.data;
                    const createdName = createdSubtable?.name || name.trim();
                    if (createdName) {
                        navigate(`/s/${createdName}`);
                    } else {
                        navigate('/');
                    }
                }, 1500);
            } else {
                let errorMessage = actionData.message || 'Failed to create community.';
                if (actionData.field === 'name') {
                    setNameError(errorMessage);
                } else if (actionData.field === 'description') {
                    setDescriptionError(errorMessage);
                } else {
                    setMessage({type: 'danger', text: errorMessage});
                }
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
        if (message) {
            setMessage(null);
        }
        if (nameError) {
            setNameError('');
        }
    };

    const handleDescriptionChange = (e) => {
        const newDescription = e.target.value;
        if (newDescription.length <= descriptionCharacterLimit) {
            setDescription(newDescription);
        }
        if (descriptionError) {
            setDescriptionError('');
        }
        if (message) {
            setMessage(null);
        }
    };

    const validateStep1 = useCallback(() => {
        let isValid = true;
        let currentNameError = '';
        let currentDescriptionError = '';
        let currentName = name.trim();

        if (!currentName) {
            currentNameError = 'A community name is required.';
            isValid = false;
        } else if (currentName.length < 3) {
            currentNameError = 'Name must be between 3 and 21 characters.';
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(currentName)) {
            currentNameError = 'Letters, numbers, and underscores only.';
            isValid = false;
        } else if (currentName.length > nameCharacterLimit) {
            currentNameError = `Name cannot exceed ${nameCharacterLimit} characters.`;
            isValid = false;
        }

        if (description.length > descriptionCharacterLimit) {
            currentDescriptionError = `Description cannot exceed ${descriptionCharacterLimit} characters.`;
            isValid = false;
        }

        setNameError(currentNameError);
        setDescriptionError(currentDescriptionError);
        return isValid;
    }, [name, description, nameCharacterLimit, descriptionCharacterLimit]);

    const handleNext = () => {
        if (validateStep1()) {
            setCurrentStep(2);
            setMessage(null);
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
        setMessage(null);
    };

    const handleSubmit = (event) => {
        setMessage(null);
        const isStep1DataValid = validateStep1();

        if (!isStep1DataValid) {
            setCurrentStep(1);
            // Optionally prevent form submission if client-side validation fails hard
            // event.preventDefault();
        } else {
            setNameError('');
            setDescriptionError('');
            // console.log("Client-side validation for Step 1 data passed. Allowing fetcher.Form to submit.");
        }
    };

    const renderStep1 = () => (
        <>
            {/* Wrapper for Name Input and its helper texts. Input component handles its own mb-3. */}
            <div>
                <Input
                    id="subtable-name"
                    name="name"
                    type="text"
                    label="Name"
                    placeholder=" " // Required for floating label
                    value={name}
                    onChange={handleNameChange}
                    required
                    disabled={isSubmitting}
                    addonBefore={<Icon name="community" size="16"/>}
                    isInvalid={!!nameError}
                    feedback={nameError}
                />
                {/* Helper texts below the input, using Bootstrap flex utilities for layout */}
                <div className="d-flex justify-content-between fs-8 mt-1">
                    <small className="text-muted">
                        Community names including capitalization cannot be changed.
                    </small>
                    <small className="text-muted">
                        s/{name} • {nameCharacterLimit - name.length} characters remaining
                    </small>
                </div>
            </div>

            {/* Wrapper for Description Input and its helper text. Input component handles its own mb-3. */}
            <div
                className="mt-3"> {/* Add margin top to separate from previous field group if Input's mb-3 isn't enough */}
                <Input
                    id="subtable-description"
                    name="description"
                    type="textarea"
                    label="Description (Optional)"
                    placeholder=" " // Required for floating label
                    value={description}
                    onChange={handleDescriptionChange}
                    disabled={isSubmitting}
                    isInvalid={!!descriptionError}
                    feedback={descriptionError}
                    rows={4}
                    // maxLength={descriptionCharacterLimit} // Note: Input.jsx needs to pass this for it to be an HTML attribute
                />
                <small className="text-muted d-block text-end fs-8 mt-1">
                    This is how new members come to understand your community.
                    • {descriptionCharacterLimit - description.length} characters remaining
                </small>
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
            <input type="hidden" name="name" value={name}/>
            <input type="hidden" name="description" value={description}/>

            <div className="mb-4"> {/* Removed fs-6 from here */}
                <h6 className="form-label-group">Appearance (Optional)</h6>
                <div className="border p-3 rounded mb-3">
                    <Input
                        id="subtable-icon-file"
                        name="iconFile"
                        type="file"
                        label="Icon Image"
                        showLabelForFile={true}
                        disabled={isSubmitting}
                        addClass="form-control-sm"
                        // accept="image/png, image/jpeg" // Note: Input.jsx needs to pass this
                    />
                    <small className="text-muted d-block fs-8 mt-1">Recommended size: 256x256px</small>
                </div>
                <div className="border p-3 rounded">
                    <Input
                        id="subtable-banner-file"
                        name="bannerFile"
                        type="file"
                        label="Banner Image"
                        showLabelForFile={true}
                        disabled={isSubmitting}
                        addClass="form-control-sm"
                        // accept="image/png, image/jpeg" // Note: Input.jsx needs to pass this
                    />
                    <small className="text-muted d-block fs-8 mt-1">Recommended size: 1920x384px</small>
                </div>
            </div>

            <input type="hidden" name="subtableType" value={subtableType}/>
            <div className="form-check form-switch mb-4 adult-content-switch"> {/* Removed fs-6 */}
                <input
                    className="form-check-input" type="checkbox" role="switch"
                    id="isNSFW" name="isNSFW" checked={isNSFW}
                    onChange={(e) => setIsNSFW(e.target.checked)}
                    disabled={isSubmitting}
                />
                <label className="form-check-label" htmlFor="isNSFW">
                    <strong>Adult Content (NSFW)</strong>
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
                Cancel
            </Button>
            <div className="d-flex gap-2">
                {currentStep === 1 && (
                    <Button
                        onClick={handleNext}
                        type="button"
                        addClass="btn-primary px-4 modal-button-custom"
                        disabled={isSubmitting || !name.trim() || !!nameError || name.trim().length < 3 || name.trim().length > nameCharacterLimit || !!descriptionError}
                    >
                        Next
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
                            Back
                        </Button>
                        <Button
                            type="submit"
                            addClass="btn-primary px-4 modal-button-custom"
                            form="create-subtable-form"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Community'}
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
            title="Create a Community"
            footer={modalFooter}
        >
            <Form
                id="create-subtable-form"
                method="post"
                action="/s"
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