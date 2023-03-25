import React, { useState } from "react";
import styles from "./index.module.css";
import {
  Button,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";
import { clientEvents, serverEvents } from "@/utils/constants";

const UserInfo = ({ socket, setUsername, setTable }) => {
  const [transientUsername, setTransientUsername] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Estamos enviando tu información al servidor, espera un momento..."
  );

  const handletTransientUsernameChange = (e) =>
    setTransientUsername(e.target.value);

  const isTransientUsernameError =
    transientUsername !== "" && transientUsername.length < 4;

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    setTimeout(() => {
      socket.connect();
      setLoadingMessage("Esperando respuesta del servidor...");

      socket.emit(clientEvents.newPlayer, { playerName: "Carlos" });
      socket.on(serverEvents.tableAssigned, ({ table }) => {
        if (table) {
          console.log("table assigned", table);
          setUsername(transientUsername);
          setTable(table);
        }
      });
    }, 2000);
  };

  return (
    <Card maxW="768px">
      <CardBody>
        <Heading as="h1" size="3xl" mb="6" textAlign="center">
          Bingo
        </Heading>
        <Heading as="h2" size="1xl" mb="4">
          ¡Bienvenido al lobby del bingo!
        </Heading>
        <Text mb="8">
          Antes de poder empezar a jugar, debes identificarte debidamente para
          anotarte en nuestra partida.
        </Text>

        <form onSubmit={handleSubmit}>
          <FormControl isRequired isInvalid={isTransientUsernameError}>
            <FormLabel>Nombre de usuario</FormLabel>
            <Input
              type="text"
              placeholder="Usuario"
              value={transientUsername}
              onChange={handletTransientUsernameChange}
              isDisabled={isLoading}
            />
            {!isTransientUsernameError ? (
              <FormHelperText as="label">
                Ingresa un nombre de usuario para identificarte, este debe tener
                al menos 4 caracteres.
              </FormHelperText>
            ) : (
              <FormErrorMessage as="label">
                ¡Ingresa al menos 4 caracteres!
              </FormErrorMessage>
            )}
          </FormControl>

          <Button
            mt="4"
            width="100%"
            type="submit"
            colorScheme="purple"
            isDisabled={transientUsername.length < 4}
            isLoading={isLoading}
          >
            Entrar al juego
          </Button>
          {isLoading && (
            <Text color="gray.600" mb="8">
              {loadingMessage}
            </Text>
          )}
        </form>
      </CardBody>
    </Card>
  );
};

export default UserInfo;
