import React, {useCallback, useEffect, useState} from 'react';
import './UserSearchBox.css';
import Input from '#shared/components/UIElement/Input/Input';
import Button from '#shared/components/UIElement/Button/Button';
import Avatar from '#shared/components/UIElement/Avatar/Avatar';
import Identifier from '#shared/components/UIElement/Identifier/Identifier';
import searchService from '#services/searchService';
import LoadingSpinner from '#shared/components/UIElement/LoadingSpinner/LoadingSpinner';

export default function UserSearchBox({isOpen, onClose, onUserSelected}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const performSearch = useCallback(
        debounce(async (query) => {
            if (query.trim() === '') {
                setSearchResults([]);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const response = await searchService.searchUsers({q: query, limit: 10});
                if (response.success && response.data?.users) {
                    setSearchResults(response.data.users);
                } else {
                    setSearchResults([]);
                    setError(response.message || 'No users found or failed to search.');
                }
            } catch (err) {
                setError(err.message || 'An error occurred while searching.');
                setSearchResults([]);
            }
            setIsLoading(false);
        }, 300),
        []
    );

    useEffect(() => {
        if (isOpen && searchQuery.trim() !== '') {
            performSearch(searchQuery);
        } else if (isOpen) {
            setSearchResults([]);
            setIsLoading(false);
            setError(null);
        }
    }, [searchQuery, isOpen, performSearch]);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setIsLoading(false);
            setError(null);
        }
    }, [isOpen]);

    const handleUserClick = (user) => {
        if (onUserSelected) {
            onUserSelected(user);
        }
        setSearchQuery('');
        setSearchResults([]);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="user-search-box-container d-flex flex-column h-100">
            <div className="user-search-box-header d-flex justify-content-between align-items-center px-3 py-2">
                <span className="fw-bold fs-6 mb-0">Tìm kiếm người dùng</span>
                <Button
                    type="button"
                    onClick={onClose}
                    mainClass="btn-close btn-close-white"
                    addClass="p-0"
                    aria-label="Đóng"
                    padding="2" // Padding for larger click area
                />
            </div>
            <div className="user-search-box-body p-3 flex-grow-1 overflow-auto">
                <Input
                    id="user-search-input"
                    name="userSearch"
                    type="search" // Use type="search" for semantics
                    placeholder="Search for users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    addClass="form-control p-3"
                />
                {isLoading && <LoadingSpinner message="Searching..." size={30} addClass="mt-3"/>}
                {error && <div className="alert alert-danger p-2 small mt-3">{error}</div>}
                {!isLoading && !error && searchResults.length === 0 && searchQuery.trim() !== '' && (
                    <div className="text-muted text-center p-2 small mt-3">No users found for "{searchQuery}".</div>
                )}
                {!isLoading && searchResults.length > 0 && (
                    <ul className="list-group user-search-results-list">
                        {searchResults.map((user) => (
                            <li
                                key={user.userId || user.principalId}
                                className="list-group-item list-group-item-action d-flex align-items-center p-2"
                                onClick={() => handleUserClick(user)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleUserClick(user)}
                            >
                                <Avatar
                                    src={user.avatar}
                                    alt={user.displayName || user.username}
                                    width={32}
                                    height={32}
                                    addClass="me-2 rounded-circle"
                                />
                                <div className="user-search-result-info">
                                    <div className="fw-bold small">{user.displayName || user.username}</div>
                                    {user.username &&
                                        <Identifier type="user" namespace={user.username} addClass="text-muted"/>}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}