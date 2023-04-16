import React, { useEffect, useState } from "react";
import { Box, Center, Heading, Grid, GridItem, Button, Spinner, Text, Flex, HStack } from "@chakra-ui/react";
import styles from "./index.module.css";
import { clientEvents, serverEvents } from "@/utils/constants";

const BingoCard = ({ socket, table = [], setTable, setWinner }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [card, setCard] = useState(table);
    const [loadingMessage, setLoadingMessage] = useState("Esperando al usuario por escoger un cartón...");
    const [hasAcceptedCard, setHasAcceptedCard] = useState(false);
    const [previousNumber, setPreviousNumber] = useState(null);
    const [playerId, setPlayerId] = useState(null);
    const [otherPlayers, setOtherPlayers] = useState([]);
    const [haveWonMessage, setHaveWonMessage] = useState("");

    const isSocketConnected = socket && socket.connected;

    const findIndexItem = (value) => {
        const index = card.findIndex((item) => item.value === value);
        return index;
    };
    
    const markItem = (index) => {
        if (index === -1) return;
        if (card[index].marked) return;
        if (card[index].color === "green.200") return;
        if (card.length === 0) return;
        if (index > card.length) return;

        const newCard = [...card];
        newCard[index].color = "green.200";
        newCard[index].marked = true;
        setCard(newCard);
    };

    const flattenCardArray = (array = []) => {
        const newCard = array.flat().map(value => ({ value, color: "purple.200", marked: false }));
        return newCard;
    };

    const requestCard = () => {
        if (!hasAcceptedCard && isSocketConnected) {
            setIsLoading(true);
            setCard([]);

            socket.emit(clientEvents.answerTable, { accept: false });
            socket.on(serverEvents.tableAssigned, ({ table }) => {
                if (table) {
                    const newCard = flattenCardArray(table);
                    setTable(table);
                    setCard(newCard);
                    if (newCard.length > 0) {
                        setIsLoading(false);
                    }
                }
            });
        }
    };

    const acceptCard = () => {
        setHasAcceptedCard(true);
        setLoadingMessage("Esperando nuevos numeros...");
        if (isSocketConnected) {
            socket.emit(clientEvents.answerTable, { accept: true });
            socket.on(serverEvents.joinedGame, ({ otherPlayers, player }) => {
                if (!playerId) {
                    setPlayerId(player);
                    setOtherPlayers(otherPlayers);
                }
            });
        }
    };

    const claimWin = () => {
        setTimeout(() => {
            setHaveWonMessage("");
        }, 3000);
        setHaveWonMessage("No hay ganadores todavía!");
        if (isSocketConnected) {
            socket.emit(clientEvents.claimWin);
            socket.on(serverEvents.win, ({ winner }) => {
                console.log("WINNER", winner)
                setWinner(winner.name);
            });
        }
    };

    useEffect(() => {
        const newCard = flattenCardArray(table);
        setCard(newCard);
        if (newCard.length > 0) {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (hasAcceptedCard && isSocketConnected) {
            socket.emit(clientEvents.changeGameMode, { mode: "FULL" });

            socket.on(serverEvents.newNumber, ({ number }) => {
                if (number) {
                    const index = findIndexItem(number);
                    console.log("new number!", number, "index", index);
                    markItem(index);
                    setPreviousNumber(number);
                }
            });
        }
    }, [hasAcceptedCard, socket]);

    return (
        <Center h="100vh">
            <Box bg="white" w="532px" p={4} boxShadow="lg" borderRadius="md">
                <Flex alignItems="center" justifyContent="flex-end" mb={3}>
                    <Box
                    w={4}
                    h={4}
                    borderRadius="full"
                    bg={isSocketConnected ? "green.500" : "red.500"}
                    mr={2}
                    />
                    <Text fontSize="sm" fontWeight="medium">
                        {isSocketConnected ? "Conectado" : "Desconectado"}
                    </Text>
                </Flex>
                <Flex justifyContent="space-between" alignItems="center" mb={4}>
                    <Text color="gray.500">{loadingMessage}</Text>
                    {!hasAcceptedCard && card.length > 0 && (
                        <HStack spacing={2}>
                            <Button colorScheme="green" size="sm" onClick={acceptCard}>
                                Aceptar
                            </Button>
                            <Button colorScheme="purple" size="sm" onClick={requestCard}>
                                Regenerar
                            </Button>
                        </HStack>
                    )}
                </Flex>
                <div className={styles.card}>
                    <Box p={8} w="500px" boxShadow="lg" borderRadius="md">
                        <Grid templateColumns="repeat(5, 1fr)" templateRows='repeat(1, 1fr)' gap={4} style={{ textAlign: "center" }}>
                            <GridItem pt={5} colSpan={1} w={16} h={16}><Heading mb={4}>
                                <Text textAlign="center">
                                    B
                                </Text>
                            </Heading></GridItem>
                            <GridItem pt={5} colSpan={1} w={16} h={16}><Heading mb={4}>
                                <Text textAlign="center">
                                    I
                                </Text>
                            </Heading></GridItem>
                            <GridItem pt={5} colSpan={1} w={16} h={16}><Heading mb={4}>
                                <Text textAlign="center">
                                    N
                                </Text>
                            </Heading></GridItem>
                            <GridItem pt={5} colSpan={1} w={16} h={16}><Heading mb={4}>
                                <Text textAlign="center">
                                    G
                                </Text>
                            </Heading></GridItem>
                            <GridItem pt={5} colSpan={1} w={16} h={16}><Heading mb={4}>
                                <Text textAlign="center">
                                    O
                                </Text>
                            </Heading></GridItem>
                            {isLoading ? (
                                <Center h={200}>
                                    <Spinner size="xl" />
                                </Center>
                            ) : (
                                card.map((item, index) => (
                                    <GridItem key={index} pt={5} colSpan={1} w={16} h={16} bg={item.color}>
                                        {item.value}
                                    </GridItem>
                                ))
                            )}
                        </Grid>
                        {hasAcceptedCard && (
                            <Flex justifyContent="space-between">
                                <Button mt={4} colorScheme="teal" onClick={claimWin} disabled={isLoading}>
                                    Bingo!
                                </Button>
                                <Text 
                                    m={4}
                                    fontSize={16}
                                    fontWeight="bold"
                                    textAlign="center"
                                >
                                    {haveWonMessage}
                                </Text>

                                <Flex alignItems="center" justifyContent="flex-end">
                                    <Box
                                        mt={4}
                                        mr={2}
                                    >
                                        <Text>Numero anterior: </Text>
                                    </Box>
                                    <Box
                                        w={10}
                                        h={10}
                                        borderWidth={1}
                                        borderStyle="solid"
                                        borderColor="gray.300"
                                        borderRadius="md"
                                        textAlign="center"
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        fontWeight="bold"
                                        mt={4} 
                                        mr={4}
                                    >
                                        <Text>{previousNumber}</Text>
                                    </Box>
                                </Flex>
                            </Flex>
                        )}
                    </Box>
                </div>
            </Box>
        </Center>
    );
};

export default BingoCard;
