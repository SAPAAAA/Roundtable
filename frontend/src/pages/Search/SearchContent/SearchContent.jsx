import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Helmet } from "react-helmet";
import PostPreview from "#features/posts/components/PostPreview/PostPreview";
import searchService from "#services/search.service";
import SearchSidebarContent from "../SearchSidebar/SearchSidebar";
import LoadingSpinner from "#shared/components/UIElement/LoadingSpinner/LoadingSpinner";
import Identifier from "#shared/components/UIElement/Identifier/Identifier";

const SORT_OPTIONS = {
    RELEVANCE: 'relevance',
    NEWEST: 'newest',
    VOTES: 'votes'
};

const SECTIONS = [
    { key: 'posts', label: 'Posts' },
    { key: 'communities', label: 'Communities' },
    { key: 'people', label: 'People' }
  ];
  
  const TIME_OPTIONS = {
    ALL: 'all',
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year'
  };


export default function SearchContent() {
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState(SORT_OPTIONS.RELEVANCE);
    const [selectedSection, setSelectedSection] = useState('posts');
    const [timeFilter, setTimeFilter] = useState(TIME_OPTIONS.ALL);
    
    const query = searchParams.get('q');

    useEffect(() => {
        const fetchData = async () => {
            if (!query) {
                setPosts([]);
                setCommunities([]);
                setPeople([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                if (selectedSection === 'posts') {
                    const response = await searchService.searchPosts({
                        query,
                        sortBy,
                        limit: 50
                    });
                    setPosts(response.data?.posts || []);
                } else if (selectedSection === 'communities') {
                    const response = await searchService.searchCommunities({
                        query,
                        limit: 50
                    });
                    setCommunities(response.data?.communities || response.data || []);
                } else if (selectedSection === 'people') {
                    const response = await searchService.searchUsers({
                        query,
                        limit: 50
                    });
                    let usersArr = [];
                    if (Array.isArray(response.data?.users)) {
                        usersArr = response.data.users;
                    } else if (Array.isArray(response.data?.data)) {
                        usersArr = response.data.data;
                    } else if (Array.isArray(response.data)) {
                        usersArr = response.data;
                    } else {
                        usersArr = [];
                    }
                    setPeople(usersArr);
                }
            } catch (error) {
                setError(error.message || "Failed to load search results. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [query, sortBy, timeFilter, selectedSection]);

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    const handleTimeChange = (event) => {
        setTimeFilter(event.target.value);
    };

    const renderSectionTabs = () => (
        <div className="section-tabs d-flex mb-3">
          {SECTIONS.map(section => (
            <button
              key={section.key}
              className={`btn me-2 ${selectedSection === section.key ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedSection(section.key)}
            >
              {section.label}
            </button>
          ))}
        </div>
    );
    
      const renderTimeOptions = () => (
        <select
          value={timeFilter}
          onChange={handleTimeChange}
          className="form-select"
          aria-label="Filter by time"
        >
          <option value={TIME_OPTIONS.ALL}>All time</option>
          <option value={TIME_OPTIONS.DAY}>Past 24 hours</option>
          <option value={TIME_OPTIONS.WEEK}>Past week</option>
          <option value={TIME_OPTIONS.MONTH}>Past month</option>
          <option value={TIME_OPTIONS.YEAR}>Past year</option>
        </select>
    );

    const renderSortOptions = () => (
        <select
            value={sortBy}
            onChange={handleSortChange}
            className="form-select"
            aria-label="Sort search results"
        >
            <option value={SORT_OPTIONS.RELEVANCE}>Most Relevant</option>
            <option value={SORT_OPTIONS.NEWEST}>Newest</option>
            <option value={SORT_OPTIONS.VOTES}>Most Voted</option>
        </select>
    );

    const renderSearchResults = () => {
        if (loading) {
            return <LoadingSpinner message="Loading search results..." />;
        }
        if (error) {
            return (
                <div className="alert alert-danger" role="alert">{error}</div>
            );
        }
        if (!query) {
            return (
                <div className="text-center py-5">
                    <h3>Enter a search query to find {selectedSection}</h3>
                </div>
            );
        }
        if (selectedSection === 'posts') {
            if (posts.length === 0) {
                return <div className="text-center py-5"><h3>No posts found for "{query}"</h3></div>;
            }
            return (
                <div className="posts-container">
                    {posts.map(post => {
                        const subtable = {
                            subtableId: post.subtableId,
                            name: post.subtableName,
                            icon: post.subtableIcon || null,
                            banner: post.subtableBanner || null,
                            description: post.subtableDescription || null,
                            memberCount: post.subtableMemberCount || 0,
                            createdAt: post.subtableCreatedAt || null,
                            creatorUserId: post.authorUserId || null
                        };
                        return (
                            <PostPreview
                                key={post.postId}
                                post={post}
                                subtable={subtable}
                            />
                        );
                    })}
                </div>
            );
        } else if (selectedSection === 'communities') {
            if (communities.length === 0) {
                return <div className="text-center py-5"><h3>No communities found for "{query}"</h3></div>;
            }
            return (
                <div className="communities-container">
                    {communities.map(community => (
                        <div key={community.id || community.subtableId} className="card p-3 my-2">
                            <div className="d-flex align-items-center">
                                <img src={community.icon || community.avatarUrl} alt={community.name} width={40} height={40} className="me-3 rounded-circle" />
                                <div>
                                    <div className="fw-bold">{community.name}</div>
                                    <div className="text-muted small">{community.memberCount || 0} members</div>
                                    <div className="text-muted small">{community.description}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else if (selectedSection === 'people') {
            if (!Array.isArray(people) || people.length === 0) {
                return <div className="text-center py-5"><h3>No people found for "{query}"</h3></div>;
            }
            return (
                <div className="people-container">
                    {people.map(person => (
                        <div key={person.userId || person.id} className="card p-3 my-2">
                            <div className="d-flex align-items-center">
                                <img src={person.avatar} alt={person.name} width={40} height={40} className="me-3 rounded-circle" />
                                <div>
                                <Identifier type="user" namespace={person.displayName} className="fw-bold" />                                    <div className="text-muted small">{person.karma || 0} karma</div>
                                    {person.bio && <div className="text-muted small">{person.bio}</div>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    };

    return (
        <div className="search-content">
            <Helmet>
                <title>{query ? `Search Results for "${query}"` : 'Search'}</title>
                <meta name="description" content={query ? `Search results for ${query}` : 'Search posts, communities, and users'} />
            </Helmet>

            <div className="container py-4">
                {renderSectionTabs()}
                <div className="d-flex justify-content-start align-items-center mb-4">
                    {query && selectedSection === 'posts' && renderSortOptions()}
                    <div className="ms-2">{query && selectedSection === 'posts' && renderTimeOptions()}</div>
                </div>

                <div className="row">
                    <div className="col-lg-8">
                        {renderSearchResults()}
                    </div>
                    <div className="col-lg-4">
                        <SearchSidebarContent />
                    </div>
                </div>
            </div>
        </div>
    );
} 