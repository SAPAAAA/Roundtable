import React, {useEffect, useState} from 'react';
import {useActionData, useLocation, useNavigate, useNavigation} from 'react-router';
import './CreateProfile.css';

import Button from '#shared/components/UIElement/Button/Button';
import Input from '#shared/components/UIElement/Input/Input';
import Form from '#shared/components/UIElement/Form/Form';
import LoadingSpinner from '#shared/components/UIElement/LoadingSpinner/LoadingSpinner';
import Icon from '#shared/components/UIElement/Icon/Icon';

function CreateProfile() {
    const navigate = useNavigate();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';
    const actionData = useActionData();
    const location = useLocation();

    const profileId = location.state?.profileId;

    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        location: '',
        gender: '',
        avatarFile: null,
        bannerFile: null
    });
    const [formErrors, setFormErrors] = useState({});
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleFileChange = (e) => {
        const {name, files} = e.target;
        if (files && files[0]) {
            const file = files[0];

            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
                e.target.value = '';
                return;
            }

            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validImageTypes.includes(file.type)) {
                alert('Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WEBP).');
                e.target.value = '';
                return;
            }

            setFormData(prev => ({
                ...prev,
                [name]: file
            }));

            const fileUrl = URL.createObjectURL(file);
            if (name === 'avatarFile') {
                if (avatarPreview) {
                    URL.revokeObjectURL(avatarPreview);
                }
                setAvatarPreview(fileUrl);
            } else if (name === 'bannerFile') {
                if (bannerPreview) {
                    URL.revokeObjectURL(bannerPreview);
                }
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
    };

    const handleSkip = () => {
        navigate('/login');
    };

    useEffect(() => {
        if (actionData && actionData.success) {
            navigate('/login');
        }
        if (actionData && actionData.error) {
            console.error(actionData.error);
        }
    }, [actionData, navigate]);

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
            }
        };
    }, [avatarPreview, bannerPreview]);

    return (
        <div className="create-profile-container">
            {isSubmitting && <LoadingSpinner message="Đang tạo hồ sơ..."/>}

            <div className="create-profile-card">
                <div className="create-profile-header">
                    <h1>Tạo hồ sơ cá nhân</h1>
                    <p>Vui lòng cung cấp thông tin để hoàn tất hồ sơ của bạn</p>
                </div>

                <Form
                    id="create-profile"
                    method="post"
                    action="/create-profile"
                    mainClass="create-profile-form"
                    encType="multipart/form-data"
                >
                    <input
                        type="hidden"
                        name="profileId"
                        value={profileId || ''}
                    />

                    <div className="form-group">
                        <Input
                            id="displayName"
                            name="displayName"
                            label="Tên hiển thị"
                            placeholder=" "
                            value={formData.displayName || ''}
                            onChange={handleChange}
                            isInvalid={!!formErrors.displayName}
                            feedback={formErrors.displayName}
                            addonBefore={<Icon name="user" size="16"/>}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            type="textarea"
                            id="bio"
                            name="bio"
                            label="Giới thiệu"
                            placeholder=" "
                            value={formData.bio || ''}
                            onChange={handleChange}
                            isInvalid={!!formErrors.bio}
                            feedback={formErrors.bio}
                            rows="3"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <Input
                            id="location"
                            name="location"
                            label="Vị trí"
                            placeholder=" "
                            value={formData.location || ''}
                            onChange={handleChange}
                            isInvalid={!!formErrors.location}
                            feedback={formErrors.location}
                            addonBefore={<Icon name="location" size="16"/>}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender" className="form-label">Giới tính</label>
                        <select
                            id="gender"
                            name="gender"
                            className={`form-control ${formErrors.gender ? 'is-invalid' : ''}`}
                            value={formData.gender || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        >
                            <option value="">-- Chọn giới tính --</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="non_binary">Phi nhị phân</option>
                            <option value="other">Khác</option>
                            <option value="prefer_not_to_say">Không muốn tiết lộ</option>
                        </select>
                        {formErrors.gender && <div className="invalid-feedback">{formErrors.gender}</div>}
                    </div>


                    <div className="media-section">
                        <h3>Ảnh đại diện và ảnh bìa</h3>

                        <div className="media-item">
                            <h4>Ảnh đại diện</h4>
                            <Input
                                type="file"
                                id="avatarFile"
                                name="avatarFile"
                                label="Chọn ảnh đại diện"
                                showLabelForFile={false}
                                onChange={handleFileChange}
                                accept="image/*"
                                disabled={isSubmitting}
                                mainClass="file-input-label"
                            />
                            {avatarPreview ? (
                                <div className="image-preview">
                                    <img src={avatarPreview} alt="Avatar preview" className="avatar-preview"/>
                                </div>
                            ) : (
                                <div className="preview-placeholder">
                                    Chưa có ảnh đại diện
                                </div>
                            )}
                        </div>

                        <div className="media-item">
                            <h4>Ảnh bìa</h4>
                            <Input
                                type="file"
                                id="bannerFile"
                                name="bannerFile"
                                label="Chọn ảnh bìa"
                                showLabelForFile={false}
                                onChange={handleFileChange}
                                accept="image/*"
                                disabled={isSubmitting}
                                mainClass="file-input-label"
                            />
                            {bannerPreview ? (
                                <div className="image-preview">
                                    <img src={bannerPreview} alt="Banner preview" className="banner-preview"/>
                                </div>
                            ) : (
                                <div className="preview-placeholder">
                                    Chưa có ảnh bìa
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="button-container">
                        <Button
                            type="button"
                            mainClass="skip-button"
                            onClick={handleSkip}
                            disabled={isSubmitting}
                        >
                            Bỏ qua
                        </Button>
                        <Button
                            type="submit"
                            mainClass="submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất hồ sơ'}
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default CreateProfile;