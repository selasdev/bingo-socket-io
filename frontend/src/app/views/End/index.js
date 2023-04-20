import React, { useEffect } from "react";
import { Box, Center, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";

const EndOverlay = () => {
  useEffect(() => {
    console.log("se reiniciará en cinco segundos");

    const intervalId = setInterval(() => {
      console.log("se reinicio");
      window.location.reload();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <Box
      bg="transparent"
      pos="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={9999}
    >
      <Center h="100vh">
        <motion.div
          initial={{ translateY: "-1000%" }}
          animate={{ translateY: 0 }}
        >
          <Box
            maxW="sm"
            p={8}
            borderRadius="md"
            textAlign="center"
            bg="transparent"
          >
            <VStack spacing={4}>
              <Text
                fontSize="6xl"
                fontWeight="bold"
                textAlign="center"
                color="black"
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                El juego ha terminado.
              </Text>
            </VStack>
            <VStack marginTop={"4"}>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                textAlign="center"
                color="black"
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Regresando al lobby del juego en cinco segundos
              </Text>
            </VStack>
          </Box>
        </motion.div>
      </Center>
    </Box>
  );
};

export default EndOverlay;
