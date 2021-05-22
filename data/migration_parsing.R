library(dplyr)
library(tidyr)
library(stringr)
library(readr)
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





codes <- read_csv("codes2.csv")
population <- read_csv("population.csv") %>%
  left_join(all_codes, by=c("Code"="alpha.3")) %>%
  mutate(country.code = str_pad(country.code, 3, pad = "0")) %>%
  select(country = 1, alpha.3=2, country.code, region, sub.region, year=3, total_pop=4) %>%
  pivot_longer(7:7, names_to = "indicator", values_to = "value")

density <- read_csv("population-density.csv") %>%
  left_join(all_codes, by=c("Code"="alpha.3")) %>%
  mutate(country.code = str_pad(country.code, 3, pad = "0")) %>%
  select(country = 1, alpha.3=2, country.code, region, sub.region, year=3, density=4) %>%
  pivot_longer(7:7, names_to = "indicator", values_to = "value")


growth <- read_csv("population-growth-rates.csv") %>%
  left_join(all_codes, by=c("Code"="alpha.3")) %>%
  mutate(country.code = str_pad(country.code, 3, pad = "0")) %>%
  select(country = 1, alpha.3=2, country.code, region, sub.region, year=3, growth_rate=4) %>%
  filter(!is.na(growth_rate)) %>%
  pivot_longer(7:7, names_to = "indicator", values_to = "value")


npg <- read_csv("natural-population-growth.csv") %>%
  left_join(all_codes, by=c("Code"="alpha.3")) %>%
  mutate(country.code = str_pad(country.code, 3, pad = "0")) %>%
  select(country = 1, alpha.3=2, country.code, region, sub.region, year=3, natural_increase=4) %>%
  filter(!is.na(natural_increase)) %>%
  pivot_longer(7:7, names_to = "indicator", values_to = "value")

age_groups <- read_csv("population-by-broad-age-group.csv") %>%
left_join(all_codes, by=c("Code"="alpha.3")) %>%
  mutate(country.code = str_pad(country.code, 3, pad = "0")) %>%
  select(country = 1, alpha.3=2, country.code, region, sub.region, year=3, 
         age5=4, age5_14=5, age15_24=6, age25_64=7, age65=8) %>%
  pivot_longer(7:11, names_to = "indicator", values_to = "value")


pop.long <- rbind(population, density, growth, npg, age_groups)

pop.long %>% filter()
pop.wide <- pop.long %>%
  pivot_wider(names_from=indicator, values_from=value)

pop.wide$mig_rate <- pop.wide$growth_rate - pop.wide$natural_increase

pop.wide %>%
  filter(!is.na(mig_rate)) %>%
  mutate(indicator="mig_rate") %>%
  select(c(1:6, 17, value=16)) -> mig_rate

pop.long <- rbind(pop.long, mig_rate)

pop.long %>%
  filter(alpha.3 %in% codes$code) ->test


write_csv(pop.wide, "pop_data_wide.csv")
write_csv(test, "pop_data_long.csv")



migrant <- read_csv("ims_all_data.csv") %>%
  select(destination = 2, dest_code=4, origin=6, orig_code=7, 8:14) %>%
  mutate_if(is.character,
                str_replace_all, pattern = " ", replacement = "") %>%
  mutate_at(5:11, as.integer)

migrant %>% filter(!Code %in% codes$code) -> missing

region_data %>%
  select(-c(1)) %>%
  select_if(is.character) %>% 
  modify(~as.numeric(str_replace_all(., " ", ""))) %>%
  mutate(Destination=regions[1:6]) %>%
  select( c(8, 1:7))-> cleaned_data

latest <- subset(population, population$Year==2019 | population$Year==2018)
names(latest) <- c("Country", "alpha.3", "Year", "Total")
all_codes <- read.csv("all.csv", stringsAsFactors = F)

all_codes  %>% filter(alpha.3 %in% codes$code) -> missing


dplyr::left_join(latest, codes, by="alpha.3") %>%
  select(Country, alpha.3, country.code, region, sub.region, Year, Total) %>%
  mutate(country.code = str_pad(country.code, 3, pad = "0")) -> latest2
write.csv(latest2, "total_population.csv", row.names = F)


codes <- read.csv("all.csv", stringsAsFactors = F)
js <- jsonlite::read_json("countries-110m-noant.json")


codes %>%
  select(name, alpha.3) %>%
  rename(code = alpha.3) -> code_only
write.csv("~/4740_covid/codes.csv", row.names =F)
