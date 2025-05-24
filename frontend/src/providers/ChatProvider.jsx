import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ChatContext from '#contexts/ChatContext.jsx';
import chatService from '#services/chatService';
import useAuth from '#hooks/useAuth.jsx';

const ChatProvider = ({children}) => {
    const {user} = useAuth();
    const [conversationPartners, setConversationPartners] = useState([]);
    const [messages, setMessages] = useState({});
    const [loadedConversations, setLoadedConversations] = useState(new Set());
    const [activePartnerId, setActivePartnerIdState] = useState(null);
    const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [error, setError] = useState(null);
    const [isChatboxOpen, setIsChatboxOpen] = useState(false);

    const fetchConversations = useCallback(async () => {
        if (!user?.principalId) {
            setIsLoadingConversations(false);
            setConversationPartners([]);
            setTotalUnreadMessages(0);
            return;
        }
        setIsLoadingConversations(true);
        setError(null);
        try {
            const fetchedData = await chatService.getConversationPartners();
            const validPartners = fetchedData.partners || [];
            setConversationPartners(validPartners);
            setTotalUnreadMessages(validPartners.reduce((acc, partner) => acc + (partner.unreadCount || 0), 0));
        } catch (err) {
            setError("Failed to load conversation list.");
            setConversationPartners([]);
            setTotalUnreadMessages(0);
        } finally {
            setIsLoadingConversations(false);
        }
    }, [user]);

    const fetchMessages = useCallback(async (partnerPrincipalId) => {
        if (!partnerPrincipalId || !user?.principalId) {
            return;
        }
        setIsLoadingMessages(true);
        setError(null);
        try {
            const fetchedData = await chatService.getMessages(partnerPrincipalId);
            console.log("fetchedData", fetchedData);
            const validMessages = fetchedData.messages || [];
            console.log("validMessages", validMessages);
            setMessages(prev => ({
                ...prev,
                [partnerPrincipalId]: validMessages,
            }));
            setLoadedConversations(prev => {
                if (prev.has(partnerPrincipalId)) {
                    return prev;
                }
                const newSet = new Set(prev);
                newSet.add(partnerPrincipalId);
                return newSet;
            });
        } catch (err) {
            setError(`Failed to load messages for partner ${partnerPrincipalId}.`);
            setMessages(prev => ({...prev, [partnerPrincipalId]: prev[partnerPrincipalId] || []}));
            setLoadedConversations(prev => {
                if (prev.has(partnerPrincipalId)) {
                    return prev;
                }
                const newSet = new Set(prev);
                newSet.add(partnerPrincipalId);
                return newSet;
            });
        } finally {
            setIsLoadingMessages(false);
        }
    }, [user]);

    const readMessages = useCallback(async (partnerPrincipalId) => {
        if (!partnerPrincipalId || !user?.principalId) {
            return;
        }

        const partnerIndex = conversationPartners.findIndex(p => p.partnerPrincipalId === partnerPrincipalId);
        if (partnerIndex === -1) {
            return;
        }
        const partnerToUpdate = conversationPartners[partnerIndex];
        const unreadCountForThisPartner = partnerToUpdate.unreadCount || 0;

        if (unreadCountForThisPartner <= 0) {
            if (partnerToUpdate.unreadCount !== 0) {
                setConversationPartners(prevPartners =>
                    prevPartners.map(p =>
                        p.partnerPrincipalId === partnerPrincipalId ? {...p, unreadCount: 0} : p
                    )
                );
            }
            return;
        }

        const originalPartners = [...conversationPartners];
        const nextPartnersState = originalPartners.map(partner =>
            partner.partnerPrincipalId === partnerPrincipalId ? {...partner, unreadCount: 0} : partner
        );
        setConversationPartners(nextPartnersState);

        try {
            const success = await chatService.markMessagesAsRead(partnerPrincipalId);
            if (success) {
                const newTotalUnread = nextPartnersState.reduce((acc, partner) => {
                    return acc + (partner.unreadCount || 0);
                }, 0);
                setTotalUnreadMessages(newTotalUnread);
            } else {
                throw new Error(`API failed to mark messages as read for partner ${partnerPrincipalId}.`);
            }
        } catch (err) {
            setError("Failed to update read status on the server.");
            setConversationPartners(originalPartners);
        }
    }, [conversationPartners, user]);

    const addMessage = useCallback((newMessage) => {
        if (!newMessage?.messageId || !newMessage?.senderProfile?.principalId || !newMessage?.recipientProfile?.principalId || !user?.principalId) {
            return;
        }

        const isSender = newMessage.senderProfile.principalId === user.principalId;
        const otherPrincipalId = isSender ? newMessage.recipientProfile.principalId : newMessage.senderProfile.principalId;
        const otherUserProfile = isSender ? newMessage.recipientProfile : newMessage.senderProfile;

        if (!otherPrincipalId) {
            return;
        }

        setMessages(prev => {
            const existing = prev[otherPrincipalId] || [];
            if (existing.some(msg => msg.messageId === newMessage.messageId)) {
                return prev;
            }
            const updated = [...existing, newMessage].sort(
                (a, b) => new Date(a.messageCreatedAt).getTime() - new Date(b.messageCreatedAt).getTime()
            );
            return {...prev, [otherPrincipalId]: updated};
        });

        let shouldIncrementTotalUnread = false;
        if (otherPrincipalId !== activePartnerId && !isSender) {
            shouldIncrementTotalUnread = true;
        }

        setConversationPartners(prevPartners => {
            let partnerExists = false;
            const updatedPartners = prevPartners.map(p => {
                if (p.partnerPrincipalId === otherPrincipalId) {
                    partnerExists = true;
                    return {
                        ...p,
                        lastMessage: {
                            text: newMessage.body,
                            timestamp: newMessage.messageCreatedAt,
                            senderPrincipalId: newMessage.senderProfile.principalId,
                            isRead: newMessage.isRead,
                        },
                        unreadCount: (otherPrincipalId !== activePartnerId && !isSender) ? ((p.unreadCount || 0) + 1) : (p.unreadCount || 0),
                    };
                }
                return p;
            });

            if (!partnerExists) {
                const newPartner = {
                    partnerPrincipalId: otherPrincipalId,
                    partnerDisplayName: `${otherUserProfile.displayName || 'Unknown User'}`,
                    partnerUsername: otherUserProfile.username,
                    partnerAvatar: otherUserProfile.avatar,
                    partnerStatus: otherUserProfile.status,
                    lastMessage: {
                        text: newMessage.body,
                        timestamp: newMessage.messageCreatedAt,
                        senderPrincipalId: newMessage.senderProfile.principalId,
                        isRead: newMessage.isRead,
                    },
                    unreadCount: (otherPrincipalId !== activePartnerId && !isSender) ? 1 : 0,
                };
                updatedPartners.push(newPartner);
            }

            updatedPartners.sort(
                (a, b) => (new Date(b.lastMessage?.timestamp).getTime() || 0) - (new Date(a.lastMessage?.timestamp).getTime() || 0)
            );

            return updatedPartners;
        });

        if (shouldIncrementTotalUnread) {
            setTotalUnreadMessages(prev => prev + 1);
        }

    }, [user, activePartnerId]);


    const sendMessage = useCallback(async (recipientPrincipalId, body) => {
        if (!recipientPrincipalId || !body.trim() || !user?.principalId) {
            setError("Cannot send message: Missing recipient or body.");
            return null;
        }
        setError(null);
        try {
            const responseData = await chatService.sendMessage(recipientPrincipalId, body);
            const sentMessage = responseData.message;
            if (sentMessage) {
                addMessage(sentMessage);
                return sentMessage;
            } else {
                setError("Message sent, but failed to update local state.");
                return null;
            }
        } catch (err) {
            setError(err.message || "Failed to send message.");
            return null;
        }
    }, [addMessage, user]);

    const handleSelectChat = useCallback((partnerPrincipalId, partnerProfile = null) => {
        if (partnerPrincipalId) {
            let partner = conversationPartners.find(p => p.partnerPrincipalId === partnerPrincipalId);

            if (!partner && partnerProfile) {
                const newPartnerData = {
                    partnerPrincipalId: partnerProfile.principalId || partnerProfile.userId,
                    partnerDisplayName: partnerProfile.displayName || partnerProfile.username,
                    partnerUsername: partnerProfile.username,
                    partnerAvatar: partnerProfile.avatar,
                    partnerStatus: partnerProfile.status,
                    unreadCount: 0,
                    lastMessage: null,
                };
                setConversationPartners(prevPartners => {
                    if (prevPartners.some(p => p.partnerPrincipalId === newPartnerData.partnerPrincipalId)) {
                        return prevPartners;
                    }
                    return [...prevPartners, newPartnerData].sort(
                        (a, b) => (new Date(b.lastMessage?.timestamp).getTime() || 0) - (new Date(a.lastMessage?.timestamp).getTime() || 0)
                    );
                });
                partner = newPartnerData;
            }

            const needsFetching = !loadedConversations.has(partnerPrincipalId) || !messages[partnerPrincipalId]?.length;
            if (needsFetching) {
                fetchMessages(partnerPrincipalId);
            }

            if (partner && (partner.unreadCount || 0) > 0) {
                readMessages(partnerPrincipalId);
            }

            setActivePartnerIdState(partnerPrincipalId);
        }
    }, [fetchMessages, readMessages, messages, conversationPartners, loadedConversations, setConversationPartners]);


    const clearChatState = useCallback(() => {
        setConversationPartners([]);
        setMessages({});
        setLoadedConversations(new Set());
        setActivePartnerIdState(null);
        setTotalUnreadMessages(0);
        setIsLoadingConversations(true);
        setIsLoadingMessages(false);
        setError(null);
        setIsChatboxOpen(false);
    }, []);

    const openChatWithUser = useCallback((partnerPrincipalId, partnerProfile = null) => {
        if (!user?.principalId) {
            return;
        }
        if (!partnerPrincipalId) {
            return;
        }
        handleSelectChat(partnerPrincipalId, partnerProfile);
        setIsChatboxOpen(true);
    }, [user, handleSelectChat]);

    const toggleChatVisibility = useCallback(() => {
        setIsChatboxOpen(prev => !prev);
    }, []);


    useEffect(() => {
        if (user?.principalId) {
            fetchConversations();
        } else {
            clearChatState();
        }
    }, [user?.principalId, fetchConversations, clearChatState]);

    const value = useMemo(() => ({
        conversationPartners,
        setConversationPartners,
        messages,
        activePartnerId,
        totalUnreadMessages,
        isLoadingConversations,
        isLoadingMessages,
        error,
        isChatboxOpen,
        fetchConversations,
        fetchMessages,
        addMessage,
        sendMessage,
        readMessages,
        setActivePartnerId: handleSelectChat,
        clearChatState,
        loadedConversations,
        openChatWithUser,
        toggleChatVisibility,
    }), [
        conversationPartners, setConversationPartners, messages, activePartnerId, totalUnreadMessages, isLoadingConversations,
        isLoadingMessages, error, isChatboxOpen, fetchConversations, fetchMessages,
        addMessage, sendMessage, readMessages, handleSelectChat, clearChatState, loadedConversations,
        openChatWithUser, toggleChatVisibility
    ]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatProvider;