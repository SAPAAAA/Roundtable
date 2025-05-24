import React, {useEffect, useState} from 'react';
import {useFetcher, useNavigate} from 'react-router';
import Modal from '#shared/components/UIElement/Modal/Modal';
import Input from '#shared/components/UIElement/Input/Input';
import Button from '#shared/components/UIElement/Button/Button';
import Form from '#shared/components/UIElement/Form/Form';
import Icon from '#shared/components/UIElement/Icon/Icon';
import LoadingSpinner from '#shared/components/UIElement/LoadingSpinner/LoadingSpinner';

// import './CreateProfileModal.css'; // Create if specific styling is needed

function CreateProfileModal({isOpen, onClose, profileIdToCreate, onProfileCreationSuccess}) {
    const navigate = useNavigate();
    const fetcher = useFetcher();
    const actionData = fetcher.data;
    const isSubmitting = fetcher.state === 'submitting';

    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        location: '',
        gender: '',
        avatarFile: null,
        bannerFile: null,
    });
    const [formErrors, setFormErrors] = useState({});
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                if (onProfileCreationSuccess) {
                    onProfileCreationSuccess();
                }
                onClose();
            } else {
                setErrorMessage(actionData.message || 'Could not create profile. Please try again.');
                if (actionData.errors) {
                    setFormErrors(actionData.errors);
                }
            }
        }
    }, [actionData, onClose, onProfileCreationSuccess, navigate]);

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                displayName: '', bio: '', location: '', gender: '',
                avatarFile: null, bannerFile: null,
            });
            setFormErrors({});
            setAvatarPreview(null);
            setBannerPreview(null);
            setErrorMessage(null);
            // Clean up file input fields visually if they exist
            const avatarInput = document.getElementById('modal-avatarFile');
            if (avatarInput) avatarInput.value = '';
            const bannerInput = document.getElementById('modal-bannerFile');
            if (bannerInput) bannerInput.value = '';
        }
    }, [isOpen]);


    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        if (formErrors[name]) setFormErrors(prev => ({...prev, [name]: null}));
        if (errorMessage) setErrorMessage(null);
    };

    const handleFileChange = (e) => {
        const {name, files} = e.target;
        if (files && files[0]) {
            const file = files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert('File size limit is 5MB.');
                e.target.value = '';
                return;
            }
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validImageTypes.includes(file.type)) {
                alert('Invalid image type. Please use JPG, PNG, GIF, or WEBP.');
                e.target.value = '';
                return;
            }

            setFormData(prev => ({...prev, [name]: file}));
            const fileUrl = URL.createObjectURL(file);
            if (name === 'avatarFile') {
                if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                setAvatarPreview(fileUrl);
            } else if (name === 'bannerFile') {
                if (bannerPreview) URL.revokeObjectURL(bannerPreview);
                setBannerPreview(fileUrl);
            }
        } else {
            if (name === 'avatarFile') {
                if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                setAvatarPreview(null);
                setFormData(prev => ({...prev, avatarFile: null}));
            } else if (name === 'bannerFile') {
                if (bannerPreview) URL.revokeObjectURL(bannerPreview);
                setBannerPreview(null);
                setFormData(prev => ({...prev, bannerFile: null}));
            }
        }
        if (errorMessage) setErrorMessage(null);
    };

    useEffect(() => {
        // Cleanup object URLs on component unmount or when previews change
        const currentAvatarPreview = avatarPreview;
        const currentBannerPreview = bannerPreview;
        return () => {
            if (currentAvatarPreview) URL.revokeObjectURL(currentAvatarPreview);
            if (currentBannerPreview) URL.revokeObjectURL(currentBannerPreview);
        };
    }, [avatarPreview, bannerPreview]);


    const handleSkip = () => {
        onClose();
        navigate('/login', {state: {message: "Profile creation skipped. Please log in."}});
    };

    const modalFooter = (
        <div className="d-flex justify-content-between w-100">
            <Button type="button" mainClass="btn btn-outline-secondary" onClick={handleSkip} disabled={isSubmitting}>
                Skip
            </Button>
            <Button type="submit" form="create-profile-modal-form" mainClass="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Profile'}
            </Button>
        </div>
    );

    return (
        <Modal
            id="create-profile-modal"
            isOpen={isOpen}
            onClose={onClose}
            title="Create Your Profile"
            footer={modalFooter}
            mainClass="modal-lg" // For a wider modal
        >
            {isSubmitting && <LoadingSpinner message="Processing..."/>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <Form
                id="create-profile-modal-form"
                method="post"
                action="/create-profile" // Action route
                encType="multipart/form-data"
                fetcher={fetcher}
                preventNavigation={true}
            >
                <input type="hidden" name="profileId" value={profileIdToCreate || ''}/>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <Input
                            id="modal-displayName" name="displayName" label="Display Name" placeholder=" "
                            value={formData.displayName} onChange={handleChange}
                            isInvalid={!!formErrors.displayName} feedback={formErrors.displayName}
                            addonBefore={<Icon name="user" size="16"/>} required disabled={isSubmitting}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <Input
                            id="modal-location" name="location" label="Location (Optional)" placeholder=" "
                            value={formData.location} onChange={handleChange}
                            isInvalid={!!formErrors.location} feedback={formErrors.location}
                            addonBefore={<Icon name="location" size="16"/>} disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <Input
                        type="textarea" id="modal-bio" name="bio" label="Bio (Optional)" placeholder=" "
                        value={formData.bio} onChange={handleChange}
                        isInvalid={!!formErrors.bio} feedback={formErrors.bio}
                        rows="3" disabled={isSubmitting}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="modal-gender" className="form-label">Gender (Optional)</label>
                    <select
                        id="modal-gender" name="gender"
                        className={`form-control ${formErrors.gender ? 'is-invalid' : ''}`}
                        value={formData.gender} onChange={handleChange} disabled={isSubmitting}
                    >
                        <option value="">-- Select Gender --</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non_binary">Non-binary</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                    {formErrors.gender && <div className="invalid-feedback">{formErrors.gender}</div>}
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <h5>Avatar (Optional)</h5>
                        <Input
                            type="file" id="modal-avatarFile" name="avatarFile"
                            label="Choose Avatar"
                            showLabelForFile={true} // Keep the label text but the input itself will be styled
                            onChange={handleFileChange} accept="image/*" disabled={isSubmitting}
                            mainClass="file-input-label" // Class for the styled label acting as button
                        />
                        {avatarPreview && (
                            <div className="mt-2 text-center">
                                <img src={avatarPreview} alt="Avatar Preview" style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}/>
                            </div>
                        )}
                    </div>
                    <div className="col-md-6 mb-3">
                        <h5>Banner (Optional)</h5>
                        <Input
                            type="file" id="modal-bannerFile" name="bannerFile"
                            label="Choose Banner" showLabelForFile={true}
                            onChange={handleFileChange} accept="image/*" disabled={isSubmitting}
                            mainClass="file-input-label"
                        />
                        {bannerPreview && (
                            <div className="mt-2">
                                <img src={bannerPreview} alt="Banner Preview" style={{
                                    width: '100%',
                                    maxHeight: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                }}/>
                            </div>
                        )}
                    </div>
                </div>
            </Form>
        </Modal>
    );
}

export default CreateProfileModal;