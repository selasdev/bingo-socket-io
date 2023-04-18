import React, { useState, useEffect } from "react";
import { Box, Center, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";

const WinnerOverlay = ({ winner }) => {
  const [showConfetti, setShowConffeti] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/tsparticles-confetti@2.9.3/tsparticles.confetti.bundle.min.js";
    script.async = true;

    document.body.appendChild(script);

    setShowConffeti(true);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

  useEffect(() => {
    if (showConfetti) {
      const duration = 15 * 1000,
        animationEnd = Date.now() + duration,
        defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          })
        );
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          })
        );
      }, 250);
    }
  }, [showConfetti]);

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
                {winner} Wins!
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

export default WinnerOverlay;
