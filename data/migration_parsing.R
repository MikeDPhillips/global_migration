library(dplyr)
library(stringr)
library(purrr)

df = read.csv("2020_ims_stock.csv", stringsAsFactors = F)

regions <- c("Africa", "Asia", "Europe", "Latin America", "Northern America", "Oceania", "Other")

origins <- c("AFRICA", "ASIA", "EUROPE", "LATIN.AMERICA.AND.THE.CARIBBEAN", "NORTHERN.AMERICA", "OCEANIA", "OTHER")
origin_pos <- c(1,2, 24, 30, 36, 41, 45, 46, 51)
index <- 903, 935, 908, 904, 905, 909
dest_pos <- c(22, 28,34, 39, 43, 44)


region_data <-df[dest_pos, origin_pos]
colnames(region_data) <- c('Destination', 'Index', regions)
region_data$Destination <- regions[1:6]

region_data[,3:9 ] <- str_replace_all(region_data[,3:9], " ", "")


region_data %>%
  select(-c(1)) %>%
  select_if(is.character) %>% 
  modify(~as.numeric(str_replace_all(., " ", ""))) %>%
  mutate(Destination=regions[1:6]) %>%
  select( c(8, 1:7))-> cleaned_data

write.csv(cleaned_data, "region20_matrix.csv", row.names = F)



latest <- subset(population, population$Year==2019 | population$Year==2018)
names(latest) <- c("Country", "alpha.3", "Year", "Total")
codes <- read.csv("all.csv", stringsAsFactors = F)

dplyr::left_join(latest, codes, by="alpha.3") %>%
  select(Country, alpha.3, country.code, region, sub.region, Year, Total) %>%
  mutate(alpha.3 = str_pad(alpha.3, 3, pad = "0")-> latest2
write.csv(latest2, "total_population.csv", row.names = F)


codes <- read.csv("all.csv", stringsAsFactors = F)
js <- jsonlite::read_json("countries-110m-noant.json")
