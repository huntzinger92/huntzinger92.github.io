import { Box, Fade, Typography } from "@mui/material";
import "./Aleadotric.css";

export const DefinitionText = ({
  primaryColor,
  secondaryColor,
}: {
  primaryColor: string;
  secondaryColor: string;
}) => {
  return (
    <Box
      sx={{
        color: primaryColor,
      }}
      id="definitionContainerShown"
    >
      <Typography variant="subtitle2" fontFamily="cursive">
        <Fade in timeout={2500}>
          <span>
            <span
              id="definitionWord"
              style={{ color: secondaryColor, fontWeight: "bold" }}
            >
              Aleatory
            </span>
          </span>
        </Fade>
        <Fade in style={{ transitionDelay: "2000ms" }} timeout={3000}>
          <span>
            {" "}
            - relating to music involving elements of chance (sometimes using
            statistical or computer techniques) during their composition,
            production, or performance
          </span>
        </Fade>
      </Typography>
    </Box>
  );
};
