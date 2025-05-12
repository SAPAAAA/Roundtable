import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import SearchBar from '../components/SearchBar';
import searchService from '../services/search.service';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [results, setResults] = useState(location.state?.results || []);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('relevance');
    const query = searchParams.get('q');

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await searchService.searchPosts({
                    query,
                    sortBy,
                    limit: 50 // Increased limit since we removed pagination
                });
                setResults(response.data);
            } catch (err) {
                setError('Failed to fetch search results. Please try again.');
                console.error('Search error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query, sortBy]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <SearchBar initialQuery={query || ''} className="max-w-2xl mx-auto" />
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Search Results for "{query}"
                </h1>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded-md px-3 py-1"
                >
                    <option value="relevance">Most Relevant</option>
                    <option value="newest">Newest</option>
                    <option value="votes">Most Voted</option>
                </select>
            </div>

            {isLoading ? (
                <div className="text-center py-8">Loading...</div>
            ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
            ) : results.length === 0 ? (
                <div className="text-center py-8">No results found</div>
            ) : (
                <div className="space-y-6">
                    {results.map((post) => (
                        <div
                            key={post.id}
                            className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <h2 className="text-xl font-semibold mb-2">
                                <a href={`/posts/${post.id}`} className="hover:text-blue-500">
                                    {post.title}
                                </a>
                            </h2>
                            <p className="text-gray-600 mb-4">{post.body}</p>
                            <div className="flex items-center text-sm text-gray-500">
                                <span className="mr-4">Posted by {post.author}</span>
                                <span className="mr-4">{post.votes} votes</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults; 