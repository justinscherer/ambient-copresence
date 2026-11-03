# Inference and ML signals

## 1) Language agnostic article quality

This endpoint predicts article quality for a revision using a language-agnostic model.
You provide a revision ID and language code, and the response returns quality output for that revision.

### Documentation

- [Lift Wing API reference: language-agnostic articlequality](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_language_agnostic_articlequality_prediction)
- [Language-agnostic article-quality model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Proposed/Language-agnostic_Wikipedia_article_quality)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/articlequality:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 123456,
	"lang": "en"
}
```

Optional:

- `extended_output`

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/articlequality:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 1350687796, "lang": "en"}'
```

#### Response

```json
{
	"score": 0.9821763062465465,
	"model_name": "articlequality",
	"model_version": "1",
	"wiki_db": "enwiki",
	"revision_id": 1350687796
}
```

### Availability

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 2) Article readability

This endpoint estimates how difficult the article text is to read.
It returns readability-related output for the revision and language you provide.

### Documentation

- [Lift Wing API reference: readability](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_readability_prediction)
- [Multilingual readability model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Proposed/Multilingual_readability_model_card)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/readability:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 123456,
	"lang": "en"
}
```

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/readability:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 1350687796, "lang": "en"}'
```

#### Response

```json
{
	"model_name": "readability",
	"model_version": "4",
	"wiki_db": "enwiki",
	"revision_id": 1350687796,
	"output": {
		"score": 1.7493929862976074,
		"fk_score_proxy": 10.303658564099766
	}
}
```

### Availability

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

Supported language codes (API reference): `af`, `sq`, `am`, `ar`, `hy`, `as`, `az`, `eu`, `be`, `bn`, `bs`, `br`, `bg`, `my`, `ca`, `zh-yue`, `zh`, `zh-classical`, `hr`, `cs`, `da`, `nl`, `en`, `eo`, `et`, `tl`, `fi`, `fr`, `gl`, `ka`, `de`, `el`, `gu`, `ha`, `he`, `hi`, `hu`, `is`, `id`, `ga`, `it`, `ja`, `jv`, `kn`, `kk`, `km`, `ko`, `ku`, `ky`, `lo`, `la`, `lv`, `lt`, `mk`, `mg`, `ms`, `ml`, `mr`, `mn`, `ne`, `no`, `or`, `om`, `ps`, `fa`, `pl`, `pt`, `pa`, `ro`, `ru`, `sa`, `gd`, `sr`, `sd`, `si`, `sk`, `sl`, `so`, `es`, `su`, `sw`, `sv`, `ta`, `te`, `th`, `tr`, `uk`, `ur`, `ug`, `uz`, `vi`, `cy`, `fy`, `xh`, `yi`, `simple`.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 3) Draft quality

This endpoint predicts draft quality for a revision on supported wikis.
It returns draft-quality classes and related probabilities.

### Documentation

- [Lift Wing API reference: revscoring draftquality](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_revscoring_draftquality_prediction)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/{wiki}-draftquality:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 12345
}
```

Optional:

- `extended_output`

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/enwiki-draftquality:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 1350687796}'
```

#### Response

```json
{
	"enwiki": {
		"models": {
			"draftquality": {
				"version": "0.2.1"
			}
		},
		"scores": {
			"1350687796": {
				"draftquality": {
					"score": {
						"prediction": "OK",
						"probability": {
							"OK": 0.40004251065647617,
							"attack": 0.005451687924499667,
							"spam": 0.2798570495146997,
							"vandalism": 0.3146487519043246
						}
					}
				}
			}
		}
	}
}
```

### Availability

**Active:** where this model is deployed.

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing revscoring deployment.

Available for the following: `enwiki`, `ptwiki`.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 4) Revision quality

This endpoint predicts article quality class for a wiki revision.
It returns a quality label and class probabilities for that revision.

### Documentation

- [Lift Wing API reference: revscoring articlequality prediction](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_revscoring_articlequality_prediction)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/{wiki}-articlequality:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 1350839573
}
```

Optional:

- `extended_output` (boolean)

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/enwiki-articlequality:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 1350687796}'
```

#### Response

```json
{
	"enwiki": {
		"models": {
			"articlequality": {
				"version": "0.9.2"
			}
		},
		"scores": {
			"1350687796": {
				"articlequality": {
					"score": {
						"prediction": "FA",
						"probability": {
							"B": 0.06866911452117365,
							"C": 0.017707842006204295,
							"FA": 0.6281331126369486,
							"GA": 0.2747706589607089,
							"Start": 0.007942281113216739,
							"Stub": 0.0027769907617477703
						}
					}
				}
			}
		}
	}
}
```

### Availability

**Active:** where this model is deployed. Wikidata uses `wikidatawiki-itemquality:predict` instead.

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing revscoring deployment.

Available for the following: `{wiki}-articlequality` is documented for `enwiki`, `euwiki`, `fawiki`, `frwiki`, `glwiki`, `nlwiki`, `ptwiki`, `ruwiki`, `svwiki`, `trwiki`, `ukwiki`; Wikidata uses the separate `wikidatawiki-itemquality:predict` endpoint.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 5) Wikidata item quality

This endpoint predicts item quality class for a Wikidata revision.
It uses the Wikidata-specific itemquality URL scheme and returns class probabilities.

### Documentation

- [Lift Wing API reference: revscoring articlequality prediction](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_revscoring_articlequality_prediction) (documents the Wikidata `wikidatawiki-itemquality:predict` URL scheme)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/wikidatawiki-itemquality:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 2484352064
}
```

Optional:

- `extended_output` (boolean)

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/wikidatawiki-itemquality:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 2484051354}'
```

#### Response

```json
{
	"wikidatawiki": {
		"models": {
			"itemquality": {
				"version": "0.5.0"
			}
		},
		"scores": {
			"2484051354": {
				"itemquality": {
					"score": {
						"prediction": "A",
						"probability": {
							"A": 0.9634217589797256,
							"B": 0.02182265958408409,
							"C": 0.009460218684110233,
							"D": 0.004039016575363756,
							"E": 0.001256346176716514
						}
					}
				}
			}
		}
	}
}
```

### Availability

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing revscoring deployment.

Wikidata only (`wikidatawiki`).

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 6) Reference need

This endpoint predicts whether the content in a revision needs additional references.
It returns a score you can use to flag edits that may need citation follow-up.

### Documentation

- [Reference need endpoint reference](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_reference_need_prediction)
- [Multilingual reference need model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Production/Multilingual_reference_need)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/reference-need:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 123456,
	"lang": "en"
}
```

### Example

#### Request

```bash
curl "https://api.wikimedia.org/service/lw/inference/v1/models/reference-need:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 1350687796, "lang": "en"}'
```

#### Response

```json
{
	"model_name": "reference-need",
	"model_version": 0,
	"wiki_db": "enwiki",
	"revision_id": 1350687796,
	"reference_need_score": 0.1013215859030837
}
```

### Availability

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

## 7) Article topic

This endpoint predicts article topics from the page's outgoing wiki links.
It returns topic labels with scores, using a language-agnostic model.

### Documentation

- [Language-agnostic link-based article topic model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Production/Language_agnostic_link-based_article_topic)
- [Lift Wing API reference: outlink-topic-model](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_articletopic_outlink_prediction)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/outlink-topic-model:predict`

### Method

`POST`

### Request shape

At least one of `page_id` or `page_title` is required, plus `lang`.

```json
{
	"page_title": "Douglas_Adams",
	"lang": "en",
	"threshold": 0.1
}
```

Optional parameters documented in API reference:

- `page_id`
- `revision_id`
- `threshold`
- `features_str`
- `debug`

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/outlink-topic-model:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"page_title":"Earth","lang":"en","threshold":0.1}'
```

#### Response

```json
{
	"prediction": {
		"article": "https://en.wikipedia.org/wiki/Earth",
		"results": [
			{
				"topic": "STEM.STEM*",
				"score": 0.994098961353302
			},
			{
				"topic": "STEM.Earth_and_environment",
				"score": 0.5698626637458801
			},
			{
				"topic": "STEM.Space",
				"score": 0.546748161315918
			}
		]
	}
}
```

### Availability

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 8) Revision topic

This endpoint predicts article topics for a specific revision on a specific wiki.
It returns topic labels and probabilities so you can classify article content areas.

### Documentation

- [Lift Wing API reference: revscoring articletopic](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_revscoring_articletopic_prediction)
- [Lift Wing API reference index](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/{wiki}-articletopic:predict`

Wikidata note from API docs: `wikidatawiki-itemtopic:predict` is used for Wikidata item topics.

### Method

`POST`

### Request shape

```json
{
	"rev_id": 12345
}
```

Optional:

- `extended_output`

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/enwiki-articletopic:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 1350687796}'
```

#### Response

```json
{
	"enwiki": {
		"models": {
			"articletopic": {
				"version": "1.3.0"
			}
		},
		"scores": {
			"1350687796": {
				"articletopic": {
					"score": {
						"prediction": ["STEM.Earth and environment", "STEM.STEM*", "STEM.Space"],
						"probability": {
							"Culture.Biography.Biography*": 0.011701613253713869,
							"Culture.Biography.Women": 0.003506545840589989,
							"Culture.Food and drink": 0.00011845275241482283,
							"Culture.Internet culture": 0.000763237829666281,
							"Culture.Linguistics": 0.0008772596016259223,
							"Culture.Literature": 0.043193254180136684,
							"Culture.Media.Books": 0.016927786611205014,
							"Culture.Media.Entertainment": 0.00156846943984832,
							"Culture.Media.Films": 0.0012357026319090533,
							"Culture.Media.Media*": 0.04881271780492409,
							"Culture.Media.Music": 0.0003129490229796458,
							"Culture.Media.Radio": 0.000290784952328416,
							"Culture.Media.Software": 0.0013696731253237142,
							"Culture.Media.Television": 0.0008876195337684166,
							"Culture.Media.Video games": 3.0743766713111965e-5,
							"Culture.Performing arts": 8.58373016589836e-5,
							"Culture.Philosophy and religion": 0.022912167735498066,
							"Culture.Sports": 0.0018719162270962129,
							"Culture.Visual arts.Architecture": 0.0021688561070116576,
							"Culture.Visual arts.Comics and Anime": 0.0007090747370418228,
							"Culture.Visual arts.Fashion": 0.0002490280403455542,
							"Culture.Visual arts.Visual arts*": 0.008820035440041615,
							"Geography.Geographical": 0.035051606582694156,
							"Geography.Regions.Africa.Africa*": 0.005561271344435259,
							"Geography.Regions.Africa.Central Africa": 0.00018862548123694845,
							"Geography.Regions.Africa.Eastern Africa": 0.00022877822738494625,
							"Geography.Regions.Africa.Northern Africa": 0.0019679720767867294,
							"Geography.Regions.Africa.Southern Africa": 0.0006458008040730329,
							"Geography.Regions.Africa.Western Africa": 6.813520943550339e-5,
							"Geography.Regions.Americas.Central America": 0.0006953347929770515,
							"Geography.Regions.Americas.North America": 0.012765873014313058,
							"Geography.Regions.Americas.South America": 0.0037483349570561434,
							"Geography.Regions.Asia.Asia*": 0.012455913849544387,
							"Geography.Regions.Asia.Central Asia": 0.00033843208467763573,
							"Geography.Regions.Asia.East Asia": 0.009293284618673498,
							"Geography.Regions.Asia.North Asia": 0.0015914137485499012,
							"Geography.Regions.Asia.South Asia": 0.0004166003192793215,
							"Geography.Regions.Asia.Southeast Asia": 0.00039254494566183,
							"Geography.Regions.Asia.West Asia": 0.0007398016380594761,
							"Geography.Regions.Europe.Eastern Europe": 0.002289982951693866,
							"Geography.Regions.Europe.Europe*": 0.03305386692564714,
							"Geography.Regions.Europe.Northern Europe": 0.00801710638104169,
							"Geography.Regions.Europe.Southern Europe": 0.00240808048295467,
							"Geography.Regions.Europe.Western Europe": 0.0040862032055557175,
							"Geography.Regions.Oceania": 0.001963645375565404,
							"History and Society.Business and economics": 0.012132965233400152,
							"History and Society.Education": 0.014890536148272616,
							"History and Society.History": 0.01397540389407694,
							"History and Society.Military and warfare": 0.004792377150394233,
							"History and Society.Politics and government": 0.017199785564400907,
							"History and Society.Society": 0.16088642471264605,
							"History and Society.Transportation": 0.019918827473192333,
							"STEM.Biology": 0.021670738860532425,
							"STEM.Chemistry": 0.0021913425213621767,
							"STEM.Computing": 0.00134038556639786,
							"STEM.Earth and environment": 0.9168492819870301,
							"STEM.Engineering": 0.03097805834096776,
							"STEM.Libraries & Information": 0.008393788658179857,
							"STEM.Mathematics": 0.00013092704344992413,
							"STEM.Medicine & Health": 0.001986168425733357,
							"STEM.Physics": 0.10470071213214094,
							"STEM.STEM*": 0.9934065734188751,
							"STEM.Space": 0.8484286828749382,
							"STEM.Technology": 0.0741099360855917
						}
					}
				}
			}
		}
	}
}
```

### Availability

**Active:** Wikidata uses `wikidatawiki-itemtopic:predict` instead.

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing revscoring deployment.

Available for the following: `{wiki}-articletopic` is documented for `arwiki`, `cswiki`, `enwiki`, `euwiki`, `huwiki`, `hywiki`, `kowiki`, `srwiki`, `ukwiki`, `viwiki`; Wikidata uses the separate `wikidatawiki-itemtopic:predict` endpoint.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 9) Wikidata item topic

This endpoint predicts topic labels for Wikidata item revisions.
It returns one or more topic categories with probabilities for the given Wikidata revision.

### Documentation

- [Lift Wing API reference: revscoring articletopic](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_revscoring_articletopic_prediction) (notes `wikidatawiki-itemtopic:predict` URL scheme for Wikidata)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/wikidatawiki-itemtopic:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 2366803550
}
```

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/wikidatawiki-itemtopic:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 2484051354}'
```

#### Response

```json
{
	"wikidatawiki": {
		"models": {
			"itemtopic": {
				"version": "1.2.0"
			}
		},
		"scores": {
			"2484051354": {
				"itemtopic": {
					"score": {
						"prediction": ["STEM.STEM*", "STEM.Space"],
						"probability": {
							"Culture.Biography.Biography*": 0.006415820177137949,
							"Culture.Biography.Women": 0.0006624924087850394,
							"Culture.Food and drink": 0.0008106529942122161,
							"Culture.Internet culture": 0.000872941307292684,
							"Culture.Linguistics": 0.002695290747770885,
							"Culture.Literature": 0.0027484238481189954,
							"Culture.Media.Books": 0.0005189442370646869,
							"Culture.Media.Entertainment": 0.0022554082949713594,
							"Culture.Media.Films": 0.0019737172833861243,
							"Culture.Media.Media*": 0.007761452693058196,
							"Culture.Media.Music": 0.0008612269632902338,
							"Culture.Media.Radio": 0.00013774140001053813,
							"Culture.Media.Software": 0.001173469545569596,
							"Culture.Media.Television": 0.0015024887790805424,
							"Culture.Media.Video games": 0.0004471213730976511,
							"Culture.Performing arts": 0.0006866562068002329,
							"Culture.Philosophy and religion": 0.012738932482522733,
							"Culture.Sports": 0.0029405036310851487,
							"Culture.Visual arts.Architecture": 0.0010500989445474136,
							"Culture.Visual arts.Comics and Anime": 0.0005428568203055075,
							"Culture.Visual arts.Fashion": 0.0006242264918210261,
							"Culture.Visual arts.Visual arts*": 0.003985002512043979,
							"Geography.Geographical": 0.013003262360875095,
							"Geography.Regions.Africa.Africa*": 0.00813399056917809,
							"Geography.Regions.Africa.Central Africa": 0.0006005579227302588,
							"Geography.Regions.Africa.Eastern Africa": 0.0007652320393550818,
							"Geography.Regions.Africa.Northern Africa": 0.004929056895787522,
							"Geography.Regions.Africa.Southern Africa": 0.00043286580049364847,
							"Geography.Regions.Africa.Western Africa": 0.0007637749307949655,
							"Geography.Regions.Americas.Central America": 0.0009266593682736189,
							"Geography.Regions.Americas.North America": 0.022020230738376553,
							"Geography.Regions.Americas.South America": 0.00722152380342815,
							"Geography.Regions.Asia.Asia*": 0.03740851047670337,
							"Geography.Regions.Asia.Central Asia": 0.001127868658331572,
							"Geography.Regions.Asia.East Asia": 0.009177569429047091,
							"Geography.Regions.Asia.North Asia": 0.026313409202219737,
							"Geography.Regions.Asia.South Asia": 0.00403664036621678,
							"Geography.Regions.Asia.Southeast Asia": 0.002155549351309816,
							"Geography.Regions.Asia.West Asia": 0.0009040234496498063,
							"Geography.Regions.Europe.Eastern Europe": 0.01735092853323532,
							"Geography.Regions.Europe.Europe*": 0.07439197196029886,
							"Geography.Regions.Europe.Northern Europe": 0.020040318780167904,
							"Geography.Regions.Europe.Southern Europe": 0.004923886627666899,
							"Geography.Regions.Europe.Western Europe": 0.003573617367926575,
							"Geography.Regions.Oceania": 0.006769299517401018,
							"History and Society.Business and economics": 0.006405902517476902,
							"History and Society.Education": 0.0023015078628234073,
							"History and Society.History": 0.01730275269265649,
							"History and Society.Military and warfare": 0.007871177493893237,
							"History and Society.Politics and government": 0.007492772014149492,
							"History and Society.Society": 0.03182270998031154,
							"History and Society.Transportation": 0.005071598128914559,
							"STEM.Biology": 0.004286838470962092,
							"STEM.Chemistry": 0.002480311614102427,
							"STEM.Computing": 0.003636013986281011,
							"STEM.Earth and environment": 0.05495899528883844,
							"STEM.Engineering": 0.0014682286699083604,
							"STEM.Libraries & Information": 0.002171090371434182,
							"STEM.Mathematics": 0.0017043665532315273,
							"STEM.Medicine & Health": 0.0051206222341311095,
							"STEM.Physics": 0.07753276413657004,
							"STEM.STEM*": 0.9045598202134326,
							"STEM.Space": 0.5391776999954941,
							"STEM.Technology": 0.022579439238458423
						}
					}
				}
			}
		}
	}
}
```

### Availability

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

Wikidata only (`wikidatawiki`).

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 10) Draft topic

This endpoint predicts draft-topic categories for a wiki revision.
It returns topic predictions and probabilities for the revision you provide.

### Documentation

- [Lift Wing API reference: revscoring drafttopic prediction](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_revscoring_drafttopic_prediction)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/{wiki}-drafttopic:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 1350687796
}
```

Optional:

- `extended_output` (boolean)

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/enwiki-drafttopic:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 1350687796}'
```

#### Response

```json
{
	"enwiki": {
		"models": {
			"drafttopic": {
				"version": "1.3.0"
			}
		},
		"scores": {
			"1350687796": {
				"drafttopic": {
					"score": {
						"prediction": ["STEM.Earth and environment", "STEM.STEM*"],
						"probability": {
							"Culture.Biography.Biography*": 0.08045045408734983,
							"Culture.Biography.Women": 0.01563415085760326,
							"Culture.Food and drink": 0.0005263041249568254,
							"Culture.Internet culture": 0.0019170411380525316,
							"Culture.Linguistics": 0.003929657397100046,
							"Culture.Literature": 0.08044949616853309,
							"Culture.Media.Books": 0.014086401844802914,
							"Culture.Media.Entertainment": 0.00746158359661032,
							"Culture.Media.Films": 0.003926450555757827,
							"Culture.Media.Media*": 0.05239763052464103,
							"Culture.Media.Music": 0.0011537410561849185,
							"Culture.Media.Radio": 0.0010975424496545245,
							"Culture.Media.Software": 0.0032696618426445194,
							"Culture.Media.Television": 0.002390187193061297,
							"Culture.Media.Video games": 0.00025166630990232965,
							"Culture.Performing arts": 0.00037196285326344014,
							"Culture.Philosophy and religion": 0.006713676943460428,
							"Culture.Sports": 0.002288355893186578,
							"Culture.Visual arts.Architecture": 0.002737024892686108,
							"Culture.Visual arts.Comics and Anime": 0.0011598766944291505,
							"Culture.Visual arts.Fashion": 0.0007399200916876866,
							"Culture.Visual arts.Visual arts*": 0.011965339069051133,
							"Geography.Geographical": 0.04869233843175154,
							"Geography.Regions.Africa.Africa*": 0.00963984999989999,
							"Geography.Regions.Africa.Central Africa": 0.0005914391708034102,
							"Geography.Regions.Africa.Eastern Africa": 0.0002730455195817152,
							"Geography.Regions.Africa.Northern Africa": 0.0010204253474326603,
							"Geography.Regions.Africa.Southern Africa": 0.0004612473442234881,
							"Geography.Regions.Africa.Western Africa": 0.00026891768350000575,
							"Geography.Regions.Americas.Central America": 0.0018534581676482496,
							"Geography.Regions.Americas.North America": 0.023974165328559876,
							"Geography.Regions.Americas.South America": 0.006550081201778095,
							"Geography.Regions.Asia.Asia*": 0.016922797751446065,
							"Geography.Regions.Asia.Central Asia": 0.0011935394586015866,
							"Geography.Regions.Asia.East Asia": 0.012431986624114438,
							"Geography.Regions.Asia.North Asia": 0.0010805859654606069,
							"Geography.Regions.Asia.South Asia": 0.0008897634872587683,
							"Geography.Regions.Asia.Southeast Asia": 0.0007441022762198635,
							"Geography.Regions.Asia.West Asia": 0.001704269672252598,
							"Geography.Regions.Europe.Eastern Europe": 0.0035829354638666185,
							"Geography.Regions.Europe.Europe*": 0.03739494123276016,
							"Geography.Regions.Europe.Northern Europe": 0.008833765937950872,
							"Geography.Regions.Europe.Southern Europe": 0.006607200869021762,
							"Geography.Regions.Europe.Western Europe": 0.016374126629465562,
							"Geography.Regions.Oceania": 0.004975555302119169,
							"History and Society.Business and economics": 0.011668703704651314,
							"History and Society.Education": 0.009962806254353552,
							"History and Society.History": 0.02520944195442482,
							"History and Society.Military and warfare": 0.008212599633701263,
							"History and Society.Politics and government": 0.026387978811126287,
							"History and Society.Society": 0.17439657207809667,
							"History and Society.Transportation": 0.0515350736387013,
							"STEM.Biology": 0.06656391606773564,
							"STEM.Chemistry": 0.005455739543988112,
							"STEM.Computing": 0.003926114298414298,
							"STEM.Earth and environment": 0.9231941069942504,
							"STEM.Engineering": 0.016108083021039745,
							"STEM.Libraries & Information": 0.05718899689278377,
							"STEM.Mathematics": 0.0008265546800756186,
							"STEM.Medicine & Health": 0.0038480533113177656,
							"STEM.Physics": 0.11230611299875458,
							"STEM.STEM*": 0.9701926328736089,
							"STEM.Space": 0.07702112876026468,
							"STEM.Technology": 0.06128406423453015
						}
					}
				}
			}
		}
	}
}
```

### Availability

**Active:** where this model is deployed.

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing revscoring deployment.

Available for the following: `enwiki`.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

## 11) Language agnostic revert risk

This endpoint predicts whether a revision is likely to be reverted, using a model that is designed to work across languages.
It is useful when you want one revert-risk score format regardless of the wiki language.

### Documentation

- [Language-agnostic revert risk endpoint reference](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_reverted_risk_language_agnostic_prediction)
- [Language-agnostic revert risk model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Production/Language-agnostic_revert_risk)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/revertrisk-language-agnostic:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 123456,
	"lang": "en"
}
```

### Example

#### Request

```bash
curl "https://api.wikimedia.org/service/lw/inference/v1/models/revertrisk-language-agnostic:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 1350687796, "lang": "en"}'
```

#### Response

```json
{
	"model_name": "revertrisk-language-agnostic",
	"model_version": "3",
	"wiki_db": "enwiki",
	"revision_id": 1350687796,
	"output": {
		"prediction": true,
		"probabilities": {
			"true": 0.7697548270225525,
			"false": 0.2302451729774475
		}
	}
}
```

### Availability

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 12) Multilingual revert risk

This endpoint predicts whether a revision is likely to be reverted for supported languages.
It returns one revert-risk result for the revision you pass in.

### Documentation

- [Multilingual revert risk endpoint reference](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_reverted_risk_multilingual_prediction)
- [Multilingual revert risk model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Production/Multilingual_revert_risk)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/revertrisk-multilingual:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 123456,
	"lang": "en"
}
```

### Example

#### Request

```bash
curl "https://api.wikimedia.org/service/lw/inference/v1/models/revertrisk-multilingual:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 1350687796, "lang": "en"}'
```

#### Response

```json
{
	"model_name": "revertrisk-multilingual",
	"model_version": "4",
	"wiki_db": "enwiki",
	"revision_id": 1350687796,
	"output": {
		"prediction": false,
		"probabilities": {
			"true": 0.28305266753993896,
			"false": 0.716947332460061
		}
	}
}
```

### Availability

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

Supported language codes (API reference): `ka`, `lv`, `ta`, `ur`, `eo`, `lt`, `sl`, `hy`, `hr`, `sk`, `eu`, `et`, `ms`, `az`, `da`, `bg`, `sr`, `ro`, `el`, `th`, `bn`, `no`, `hi`, `ca`, `hu`, `ko`, `fi`, `vi`, `uz`, `sv`, `cs`, `he`, `id`, `tr`, `uk`, `nl`, `pl`, `ar`, `fa`, `it`, `zh`, `ru`, `es`, `ja`, `de`, `fr`, `en`.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 13) Wikidata revert risk

This endpoint predicts revert risk for Wikidata revisions.
It uses revision metadata and content to return a revert-likelihood output.

### Documentation

- [Lift Wing API reference: revertrisk wikidata](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_revertrisk_wikidata)
- [RevertRisk Wikidata model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Production/RevertRisk_Wikidata)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/revertrisk-wikidata:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 2484352064
}
```

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/revertrisk-wikidata:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 2484051354}'
```

#### Response

```json
{
	"model_name": "revertrisk-wikidata",
	"model_version": "2",
	"revision_id": 2484051354,
	"output": {
		"prediction": true,
		"probabilities": {
			"true": 0.5387352373078647,
			"false": 0.46126476269213534
		}
	}
}
```

### Availability

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

Wikidata revisions only.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 14) Reference risk

This endpoint predicts whether references introduced by a revision are likely to survive over time.
It returns risk-oriented fields that help identify references that may be unstable.

### Documentation

- [Lift Wing API reference: reference risk prediction](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_reference_risk_prediction)
- [Language-agnostic reference risk model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Proposed/Language-agnostic_reference_risk)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/reference-risk:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 1242378206,
	"lang": "en"
}
```

Optional:

- `extended_output` (boolean)

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/reference-risk:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 1350687796, "lang": "en"}'
```

#### Response

```json
{
	"model_name": "reference-risk",
	"model_version": "2024-11",
	"wiki_db": "enwiki",
	"revision_id": 1350687796,
	"reference_count": 199,
	"survival_ratio": {
		"min": 0.26343338900801916,
		"mean": 0.7798243261722269,
		"median": 0.8091431850341261
	},
	"reference_risk_score": 0.0
}
```

### Availability

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 15) Tone check

This endpoint runs Edit Check models on text you provide.
For tone checks, you send before-and-after text and the endpoint returns whether the new wording is likely to violate tone guidance.

Powers the **tone** suggestions in the Visual Editor.

### Documentation

- [Tone Check model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Production/Tone_Check)
- [Edit check / Tone Check overview](https://www.mediawiki.org/wiki/Edit_check/Tone_Check)

Inline explanation from project notes: this endpoint is called with batched `instances` payloads, and tone suggestions are typically filtered by `prediction == true` and a probability threshold.

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/edit-check:predict`

### Method

`POST`

### Request shape

```json
{
	"instances": [
		{
			"lang": "en",
			"check_type": "tone",
			"page_title": "Earth",
			"original_text": "Earth is the third planet from the Sun. It is the only known world with life.",
			"modified_text": "Earth is clearly the only planet that matters; the other planets are lifeless, overrated rocks that serious readers can safely ignore as irrelevant to human destiny."
		}
	]
}
```

### Example

#### Request

```bash
curl "https://api.wikimedia.org/service/lw/inference/v1/models/edit-check:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"instances":[{"lang":"en","check_type":"tone","page_title":"Earth","original_text":"Earth is the third planet from the Sun. It is the only known world with life.","modified_text":"Earth is clearly the only planet that matters; the other planets are lifeless, overrated rocks that serious readers can safely ignore as irrelevant to human destiny."}]}'
```

#### Response

```json
{
	"message": "",
	"batchId": "2b9cdabb-d7ca-46d9-8112-4b166a193724",
	"predictions": [
		{
			"check_type": "tone",
			"details": {},
			"language": "en",
			"model_name": "edit-check",
			"model_version": "v1",
			"page_title": "Earth",
			"prediction": true,
			"probability": 0.778,
			"status_code": 200
		}
	]
}
```

### Availability

**Active:** Check types may change over time.

Publicly available on `api.wikimedia.org`; this is the production inference surface used by Edit Check.

Single global endpoint. Availability is determined by supported `check_type` values (for example `tone`). The docs do not publish a single exhaustive language list for all check types.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 16) Edit check config

This endpoint returns the live JSON rules that Edit Check reads directly from wiki pages.
Those rules include phrase matching and replacement lists, so the response shows the exact configuration currently in production.

### Documentation

- [Main edit-check config raw JSON](https://en.wikipedia.org/w/index.php?title=MediaWiki:Editcheck-config.json&action=raw)
- [British-English replacement raw JSON](https://en.wikipedia.org/w/index.php?title=MediaWiki:Editcheck-config-textmatch-british-english.json&action=raw)

Inline explanation from project notes: the imported British-English replacement file contains hundreds of replacement pairs, and the main config includes multiple `textMatch.matchItems` buckets used as phrase/rule sources.

### Endpoint

- `https://en.wikipedia.org/w/index.php?title=MediaWiki:Editcheck-config.json&action=raw`
- `https://en.wikipedia.org/w/index.php?title=MediaWiki:Editcheck-config-textmatch-british-english.json&action=raw`

### Method

`GET`

### Request shape

- `title=MediaWiki:...`
- `action=raw`

### Example 1: Main config

#### Request

```bash
curl -sS "https://en.wikipedia.org/w/index.php?title=MediaWiki:Editcheck-config.json&action=raw" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

_Real output is the raw JSON on that wiki page; the snippet is a prefix of the `curl` body._

```json
{
	"addReference": {
		"ignoreLeadSection": true,
		"ignoreSections": [
			"notes",
			"notes and references",
			"references",
			"references and further reading",
			"sources",
			"footnotes",
			"citations",
			"external links",
			"external websites",
			"weblinks",
			"see also",
			"further reading",
			"bibliography",
			"publications",
			"works",
			"synopsis",
			"plot",
			"plot summary",
			"episodes",
			"summary"
		]
	},
	"externalLink": {
		"ignoreSections": [
			"notes",
			"notes and references",
			"references",
			"references and further reading",
			"sources",
			"footnotes",
			"citations",
			"external links",
			"weblinks",
			"see also",
			"further reading",
			"bibliography",
			"publications",
			"works"
		]
	},
	"disambiguation": {
		"ignoreSections": ["see also"],
		"ignoreDisambiguationPages": true
	},
	"textMatch": {
		"matchItems": {
			"british-english": {
				"import": "MediaWiki:Editcheck-config-textmatch-british-english.json"
			},
			"LLM-user-comms": {
				"query": [
					"I hope this helps",
					"Of course!",
					"Certainly!",
					"You're absolutely right!",
					"Would you like",
					"Is there anything else",
					"let me know",
					"more detailed breakdown",
					"Here is a",
					"up to my last training update",
					"as of my last knowledge update",
					"while specific details are limited",
					"while specific details are scarce",
					"in the provided sources",
					"in the available sources",
					"in the provided search results",
					"in the available search results",
					"based on available information",
					"as an AI language model",
					"as a large language model",
					"I'm sorry",
					"ChatGPT said"
				],
				"title": "Potential AI-generated content",
				"message": "This text may include [[Wikipedia:Large_language_models#Handling_suspected_LLM-generated_content|AI-generated content]]. Help readers trust the article by removing any AI content or rewriting any inaccurate, unverifiable, or unencyclopedic information.",
				"config": {
					"caseSensitive": false,
					"minimumEditcount": 10,
					"enabled": true
				},
				"expand": "paragraph"
			},
			"LLM-immediate-indicators": {
				"query": [
					"indelible mark",
					"deeply rooted",
					"profound heritage",
					"steadfast dedication",
					"continues to captivate",
					"continued to captivate",
					"continuing to captivate",
					"stunning natural",
					"rich artistic landscape",
					"rich cultural landscape",
					"rich literary landscape",
					"rich media landscape",
					"vibrant artistic landscape",
					"vibrant cultural landscape",
					"vibrant literary landscape",
					"vibrant media landscape",
					"diverse artistic landscape",
					"diverse cultural landscape",
					"diverse literary landscape",
					"diverse media landscape",
					"important to note",
					"important to remember",
					"important to consider",
					"critical to note",
					"critical to remember",
					"critical to consider",
					"crucial to note",
					"crucial to remember",
					"crucial to consider",
					"In summary",
					"In conclusion",
					"despite its challenges",
					"faces several challenges",
					"despite these challenges",
					"challenges and legacy",
					"future outlook",
					"Observers have cited"
				],
				"title": "Potential AI-generated content",
				"message": "This text may include [[Wikipedia:Large_language_models#Handling_suspected_LLM-generated_content|AI-generated content]]. Help readers trust the article by removing any AI content or rewriting any inaccurate, unverifiable, or unencyclopedic information.",
				"config": {
					"caseSensitive": false,
					"minimumEditcount": 10,
					"enabled": true
				},
				"expand": "paragraph"
			},
			"LLM-multiple-indicators": {
				"query": [
					"as a testament",
					"as a reminder",
					"is a testament",
					"is a reminder",
					"playing a vital role",
					"playing a significant role",
					"playing a crucial role",
					"plays a vital role",
					"plays a significant role",
					"plays a crucial role",
					"key turning point",
					"independent coverage",
					"local media outlets",
					"regional media outlets",
					"national media outlets",
					"music outlets",
					"business outlets",
					"tech outlets",
					"ensuring",
					"reflect",
					"reflects",
					"reflecting",
					"contributing to",
					"groundbreaking",
					"intricate",
					"enduring legacy",
					"lasting legacy",
					"nestled",
					"in the heart of",
					"boasts a",
					"may vary",
					"align",
					"aligns",
					"aligning with",
					"crucial",
					"delve",
					"delves",
					"delving",
					"emphasizing",
					"enduring",
					"enhanced",
					"enhance",
					"enhances",
					"enhancing",
					"foster",
					"fosters",
					"fostered",
					"fostering",
					"garner",
					"garners",
					"garnered",
					"garnering",
					"highlight",
					"highlighted",
					"highlighting",
					"highlights",
					"interplay",
					"intricate",
					"intricacies",
					"pivotal",
					"showcase",
					"showcased",
					"showcases",
					"showcasing",
					"tapestry",
					"underscore",
					"underscored",
					"underscores",
					"underscoring",
					"industry reports",
					"Some critics argue",
					"widely available",
					"widely documented",
					"widely disclosed"
				],
				"title": "Potential AI-generated content",
				"message": "This text may include [[Wikipedia:Large_language_models#Handling_suspected_LLM-generated_content|AI-generated content]]. Help readers trust the article by removing any AI content or rewriting any inaccurate, unverifiable, or unencyclopedic information.",
				"config": {
					"caseSensitive": false,
					"minimumEditcount": 10,
					"enabled": true,
					"minOccurrences": 3
				},
				"expand": "paragraph"
			}
		}
		// etc...
	}
}
```

### Example 2: Imported text-match set

#### Request

```bash
curl -sS "https://en.wikipedia.org/w/index.php?title=MediaWiki:Editcheck-config-textmatch-british-english.json&action=raw" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

_Real output is the raw JSON on that wiki page; the snippet is a prefix of the `curl` body._

```json
{
	"title": "Change English spelling",
	"mode": "replace",
	"message": "This word uses a different [[Wikipedia:Manual_of_Style#Retaining_the_existing_variety|English variety]] than the one used in the rest of this article. Help readers by changing the spelling to match the rest of the article.",
	"config": {
		"enabled": true,
		"ignoreLeadSection": true,
		"ignoreQuotedContent": true,
		"caseSensitive": true,
		"hasTemplate": [
			"Use British English",
			"EngvarB",
			"EB",
			"Eb",
			"Use Scottish English",
			"En-GB",
			"Use European English",
			"Use International English",
			"Use british english",
			"Use British",
			"Use british",
			"Ube",
			"UBE",
			"Engvarb",
			"Use BrE",
			"Use Welsh English",
			"Engvar-B",
			"Use British English spelling",
			"International English",
			"Engvar B",
			"Uken",
			"UKEN",
			"Use British English with -ise spellings",
			"Use British english",
			"Use British spelling"
		]
	},
	"query": {
		"accouterments": "accoutrements",
		"ameba": "amoeba",
		"amebas": "amoebas",
		"amebic": "amoebic",
		"amphitheater": "amphitheatre",
		"amphitheaters": "amphitheatres",
		"analyze": "analyse",
		"analyzed": "analysed",
		"analyzer": "analyser",
		"analyzers": "analysers",
		"analyzes": "analyses",
		"analyzing": "analysing",
		"anemia": "anaemia",
		"anemic": "anaemic",
		"appareled": "apparelled",
		"appareling": "apparelling",
		"arbor": "arbour",
		"arbors": "arbours",
		"archeological": "archaeological",
		"archeologist": "archaeologist",
		"archeologists": "archaeologists",
		"archeology": "archaeology",
		"ardor": "ardour",
		"ardors": "ardours",
		"armor": "armour",
		"armored": "armoured",
		"armorer": "armourer",
		"armorers": "armourers",
		"armories": "armouries",
		"armoring": "armouring",
		"armors": "armours",
		"armory": "armoury",
		"backpedaled": "backpedalled",
		"backpedaling": "backpedalling",
		"barreled": "barrelled",
		"barreling": "barrelling",
		"bedeviled": "bedevilled",
		"bedeviling": "bedevilling",
		"behavior": "behaviour",
		"behavioral": "behavioural",
		"belabor": "belabour",
		"belabored": "belaboured",
		"belaboring": "belabouring",
		"belabors": "belabours",
		"beveled": "bevelled",
		"beveling": "bevelling",
		"busheled": "bushelled",
		"busheling": "bushelling",
		"caliber": "calibre",
		"calibers": "calibres",
		"canceled": "cancelled",
		"canceling": "cancelling",
		"candor": "candour",
		"caroled": "carolled",
		"caroler": "caroller",
		"carolers": "carollers",
		"caroling": "carolling",
		"catalyze": "catalyse",
		"catalyzed": "catalysed",
		"catalyzing": "catalysing",
		"caviled": "cavilled",
		"caviling": "cavilling",
		"center": "centre",
		"centerfold": "centrefold",
		"centerfolds": "centrefolds",
		"centerpiece": "centrepiece",
		"centerpieces": "centrepieces",
		"centers": "centres",
		"centiliter": "centilitre",
		"centiliters": "centilitres",
		"centimeter": "centimetre",
		"centimeters": "centimetres",
		"cesium": "caesium",
		"channeled": "channelled",
		"channeling": "channelling",
		"chiseled": "chiselled",
		"chiseler": "chiseller",
		"chiselers": "chisellers",
		"chiseling": "chiselling",
		"clamor": "clamour",
		"clamored": "clamoured",
		"clamoring": "clamouring",
		"clamors": "clamours",
		"clangor": "clangour",
		"color": "colour",
		"counseled": "counselled",
		"counseling": "counselling",
		"crueler": "crueller",
		"cudgeled": "cudgelled",
		"cudgeling": "cudgelling",
		"defense": "defence",
		"defensed": "defenced",
		"defenseless": "defenceless",
		"defenses": "defences",
		"demeanor": "demeanour",
		"deviled": "devilled",
		"deviling": "devilling",
		"dialed": "dialled",
		"dialing": "dialling",
		"dialyzes": "dialyses",
		"diarrhea": "diarrhoea",
		"disemboweled": "disembowelled",
		"disemboweling": "disembowelling",
		"disfavor": "disfavour",
		"disfavored": "disfavoured",
		"disfavoring": "disfavouring",
		"disfavors": "disfavours",
		"disheveled": "dishevelled",
		"disheveling": "dishevelling",
		"doweled": "dowelled"
		// etc...
	}
}
```

### Availability

Publicly available as live on-wiki configuration pages read by production tooling.

The listed endpoints are specifically for English Wikipedia (`en.wikipedia.org`) configuration pages.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 17) Recent changes with scoring

This endpoint lists the most recent edits on a wiki, similar to the RecentChanges page. The Action API module is supported and not deprecated.

**Deprecated:** When you request `rcprop=...|oresscores|...`, the `oresscores` field carries ORES model outputs. Those scores use the same model family that Wikimedia documents as planned for deprecation in favor of Lift Wing (for example revert-risk models). Prefer calling Lift Wing directly for new integrations; keep using `recentchanges` without `oresscores` if you only need edit metadata.

It returns normal edit metadata (revision IDs, timestamps, users, comments, tags) and, when requested, `oresscores` from ORES where the wiki serves them.

### Documentation

- [API:Recentchanges](https://www.mediawiki.org/wiki/API:Recentchanges)
- [Action API main page](https://www.mediawiki.org/wiki/API:Main_page)

### Endpoint

`https://en.wikipedia.org/w/api.php?action=query&list=recentchanges`

### Method

`GET`

### Request shape

Common parameters for signal retrieval:

- `rcprop=title|timestamp|ids|user|comment|sizes|oresscores|tags`
- `rclimit=...`
- `rctype=edit|new`
- `rctoponly=1`
- optional `rcshow=oresreview`
- optional pagination/time filters (`rccontinue`, `rcstart`, `rcend`)

### Example

#### Request

```bash
curl -sG "https://en.wikipedia.org/w/api.php" \
  --data-urlencode "action=query" \
  --data-urlencode "list=recentchanges" \
  --data-urlencode "rcprop=title|timestamp|ids|user|comment|sizes|oresscores|tags" \
  --data-urlencode "rclimit=1" \
  --data-urlencode "rctype=edit|new" \
  --data-urlencode "rctoponly=1" \
  --data-urlencode "format=json" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"batchcomplete": "",
	"continue": {
		"rccontinue": "20260424142405|2020420892",
		"continue": "-||"
	},
	"query": {
		"recentchanges": [
			{
				"type": "edit",
				"ns": 3,
				"title": "User talk:Lordseriouspig",
				"pageid": 76977641,
				"revid": 1350868008,
				"old_revid": 1350866735,
				"rcid": 2020420896,
				"user": "~2026-24831-23",
				"temp": "",
				"oldlen": 32051,
				"newlen": 32109,
				"timestamp": "2026-04-24T14:24:05Z",
				"comment": "/* COI with Hack Club */ clearer",
				"tags": ["wikieditor"],
				"oresscores": []
			}
		]
	}
}
```

### Availability

Publicly available on each wiki's `api.php`; this is a core production MediaWiki Action API module (not deprecated).

**Deprecated (optional `oresscores` only):** ORES fields returned in `oresscores` are legacy relative to ORES and Lift Wing migration notes; the rest of this endpoint is normal/supported.

Available on Wikimedia wikis through each wiki's `api.php` endpoint.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 18) Deprecated: Damaging prediction

This endpoint predicts how damaging an edit is for a specific revision.
It returns a prediction plus probabilities you can use to estimate the chance that the edit is harmful.

### Documentation

- [Lift Wing damaging reference](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_revscoring_damaging_prediction)
- [Lift Wing API usage (Wikitech)](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/{wiki}-damaging:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 12345
}
```

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/enwiki-damaging:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 1350687796}'
```

#### Response

```json
{
	"enwiki": {
		"models": {
			"damaging": {
				"version": "0.5.1"
			}
		},
		"scores": {
			"1350687796": {
				"damaging": {
					"score": {
						"prediction": false,
						"probability": {
							"false": 0.9798684755361872,
							"true": 0.02013152446381285
						}
					}
				}
			}
		}
	}
}
```

### Availability

**Deprecated:** `revertrisk-language-agnostic` and `revertrisk-multilingual` are recommended as newer alternatives.

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

Available for the following: `arwiki`, `bswiki`, `cawiki`, `cswiki`, `dewiki`, `enwiki`, `eswiki`, `eswikibooks`, `eswikiquote`, `etwiki`, `fawiki`, `fiwiki`, `frwiki`, `hewiki`, `hiwiki`, `huwiki`, `itwiki`, `jawiki`, `kowiki`, `lvwiki`, `nlwiki`, `nowiki`, `plwiki`, `ptwiki`, `rowiki`, `ruwiki`, `sqwiki`, `srwiki`, `svwiki`, `ukwiki`, `wikidatawiki`, `zhwiki`.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 19) Deprecated: Good faith prediction

This endpoint predicts whether an edit appears to be made in good faith.
It returns a prediction and probabilities so you can separate likely mistakes from likely abuse.

### Documentation

- [Lift Wing goodfaith reference](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_revscoring_goodfaith_prediction)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/{wiki}-goodfaith:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 12345
}
```

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/enwiki-goodfaith:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 1350687796}'
```

#### Response

```json
{
	"enwiki": {
		"models": {
			"goodfaith": {
				"version": "0.5.1"
			}
		},
		"scores": {
			"1350687796": {
				"goodfaith": {
					"score": {
						"prediction": true,
						"probability": {
							"false": 0.009499006207313698,
							"true": 0.9905009937926863
						}
					}
				}
			}
		}
	}
}
```

### Availability

**Deprecated:** `revertrisk-language-agnostic` and `revertrisk-multilingual` are recommended as newer alternatives.

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

Available for the following: `arwiki`, `bswiki`, `cawiki`, `cswiki`, `dewiki`, `enwiki`, `eswiki`, `eswikibooks`, `eswikiquote`, `etwiki`, `fawiki`, `fiwiki`, `frwiki`, `hewiki`, `hiwiki`, `huwiki`, `itwiki`, `jawiki`, `kowiki`, `lvwiki`, `nlwiki`, `nowiki`, `plwiki`, `ptwiki`, `rowiki`, `ruwiki`, `sqwiki`, `srwiki`, `svwiki`, `ukwiki`, `wikidatawiki`, `zhwiki`.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 20) Deprecated: ORES damaging and goodfaith predictions

This endpoint returns ORES scores for one or more revision IDs and the model names you request.
It is a batch-style scoring endpoint that can return multiple model outputs in one call.

### Documentation

- [ORES overview](https://www.mediawiki.org/wiki/ORES)
- [ORES on Wikitech](https://wikitech.wikimedia.org/wiki/ORES)

### Endpoint

`https://ores.wikimedia.org/v3/scores/{wikiCode}/?models=damaging|goodfaith&revids={id1}|{id2}|...`

### Method

`GET`

### Request shape

Path:

- `{wikiCode}` (example: `enwiki`)

Query:

- `models=damaging|goodfaith`
- `revids=12345|23456`

### Example

#### Request

```bash
curl -sS "https://ores.wikimedia.org/v3/scores/enwiki/?models=damaging|goodfaith&revids=1350687796" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"enwiki": {
		"models": {
			"damaging": {
				"version": "0.5.1"
			},
			"goodfaith": {
				"version": "0.5.1"
			}
		},
		"scores": {
			"1350687796": {
				"damaging": {
					"score": {
						"prediction": false,
						"probability": {
							"false": 0.9798684755361872,
							"true": 0.02013152446381285
						}
					}
				},
				"goodfaith": {
					"score": {
						"prediction": true,
						"probability": {
							"false": 0.009499006207313698,
							"true": 0.9905009937926863
						}
					}
				}
			}
		}
	}
}
```

### Availability

**Legacy/deprecating:** Lift Wing is the recommended platform for these models.

Publicly available as a legacy compatibility endpoint.

wiki/model pairs still served by ORES; request unsupported pairs and the API returns an unavailable/missing model result.

### Rate limits

[ORES](https://www.mediawiki.org/wiki/ORES)

---

## 21) Deprecated: Reverted prediction

This endpoint predicts whether a wiki revision will be reverted, using the older revscoring reverted model.
The official docs mark this model for deprecation and recommend newer revert-risk models.

### Documentation

- [Lift Wing API reference: revscoring reverted prediction](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_revscoring_reverted_prediction)
- [Multilingual revert risk model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Production/Multilingual_revert_risk) (recommended replacement in docs)
- [Language-agnostic revert risk model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Production/Language-agnostic_revert_risk) (recommended replacement in docs)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/{wiki}-reverted:predict`

### Method

`POST`

### Request shape

```json
{
	"rev_id": 74995306
}
```

Optional:

- `extended_output` (boolean)

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/viwiki-reverted:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"rev_id": 74995306}'
```

#### Response

```json
{
	"viwiki": {
		"models": {
			"reverted": {
				"version": "0.5.0"
			}
		},
		"scores": {
			"74995306": {
				"reverted": {
					"score": {
						"prediction": false,
						"probability": {
							"false": 0.6663072574407378,
							"true": 0.33369274255926223
						}
					}
				}
			}
		}
	}
}
```

### Availability

**Deprecated:** `revertrisk-language-agnostic` and `revertrisk-multilingual` are recommended as newer alternatives.

Still callable on supported wikis.

Available for the following: `bnwiki`, `elwiki`, `enwiktionary`, `glwiki`, `hrwiki`, `idwiki`, `iswiki`, `tawiki`, `viwiki`.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

## 22) "More like" search

This endpoint performs full-text search, and it can also run "more like this" retrieval using `srsearch=morelike:...`.
It returns candidate pages that are textually similar to your seed pages.

### Documentation

- [API:Search](https://www.mediawiki.org/wiki/API:Search)

### Endpoint

`https://en.wikipedia.org/w/api.php?action=query&list=search`

### Method

`GET`

### Request shape

- `srsearch=morelike:Earth|Mars`
- `srwhat=text`
- `srlimit=10`
- `sroffset=0`
- optional `srnamespace=0`

### Example

#### Request

```bash
curl -sS "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=morelike:Earth|Mars&srwhat=text&srlimit=3&sroffset=0&format=json" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"batchcomplete": "",
	"continue": {
		"sroffset": 3,
		"continue": "-||"
	},
	"query": {
		"searchinfo": {
			"totalhits": 1194567
		},
		"search": [
			{
				"ns": 0,
				"title": "Extraterrestrial liquid water",
				"pageid": 11322595,
				"size": 75343,
				"wordcount": 7535,
				"snippet": "Extraterrestrial liquid water is water in its liquid state that naturally occurs outside Earth. It is a subject of wide interest because it is recognized",
				"timestamp": "2026-03-24T19:59:52Z"
			},
			{
				"ns": 0,
				"title": "Earth analog",
				"pageid": 26780222,
				"size": 39826,
				"wordcount": 3940,
				"snippet": "An Earth analog, also called an Earth twin or second Earth, is a planet or moon with environmental conditions similar to those found on Earth. The term",
				"timestamp": "2026-04-20T06:48:07Z"
			},
			{
				"ns": 0,
				"title": "Planetary surface",
				"pageid": 34661457,
				"size": 42947,
				"wordcount": 3834,
				"snippet": "A planetary surface is where the solid or liquid material of certain types of astronomical objects contacts the atmosphere or outer space. Planetary surfaces",
				"timestamp": "2026-02-22T10:36:18Z"
			}
		]
	}
}
```

_Captured with `srlimit=3` to keep the sample small; your own `search` array may be longer with higher limits._

### Availability

**Active:** Operator behavior depends on the wiki's search backend.

Publicly available on each wiki's `api.php`; this is a core production MediaWiki Action API module.

Available where the search backend supports the `morelike:` operator (commonly CirrusSearch-backed wikis).

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 23) List-building

This endpoint returns a ranked list of candidate pages from a multi-source list-building service.
It combines several retrieval channels and returns unified results for exploration workflows.

### Documentation

No official public documentation URL was found in fetched sources; endpoint is observed directly in production usage.

### Endpoint

`https://list-building.toolforge.org/api/serpentine`

### Method

`GET`

### Request shape

Query params used:

- `lang`
- `k-reader`
- `k-links`
- `k-morelike`
- optional `page_title`
- optional `qid`

### Example

#### Request

```bash
curl -sS "https://list-building.toolforge.org/api/serpentine?lang=en&k-reader=3&k-links=3&k-morelike=3&page_title=Earth" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"qid": "Q2",
	"results": [
		{
			"description": "another planet with environmental conditions similar to those found on the planet Earth",
			"page_title": "Earth analog",
			"qid": "Q2670101",
			"redlink": false,
			"source": "morelike"
		},
		{
			"description": "geology of Mercury, Venus, Earth, Mars and Ceres",
			"page_title": "Geology of solar terrestrial planets",
			"qid": "Q5535416",
			"redlink": false,
			"source": "links"
		},
		{
			"description": "Galilean moon of Jupiter",
			"page_title": "Europa (moon)",
			"qid": "Q3143",
			"redlink": false,
			"source": "morelike"
		},
		{
			"description": "apparent mystery that the early Earth seems to have had liquid water, even though the young Sun was less bright, thus presumably completely freezing the Earth",
			"page_title": "Faint young Sun paradox",
			"qid": "Q686707",
			"redlink": false,
			"source": "links"
		},
		{
			"description": "water",
			"page_title": "Extraterrestrial liquid water",
			"qid": "Q1319471",
			"redlink": false,
			"source": "morelike"
		},
		{
			"page_title": "-",
			"qid": "Q111954298",
			"redlink": true,
			"source": "links"
		},
		{
			"description": "possible upcoming scenarios for Earth",
			"page_title": "Future of Earth",
			"qid": "Q2003654",
			"redlink": false,
			"source": "morelike"
		},
		{
			"description": "structure and composition of the Moon",
			"page_title": "Geology of the Moon",
			"qid": "Q1648514",
			"redlink": false,
			"source": "links"
		},
		{
			"description": "fourth planet from the Solar System, tellurian and orange-red due to iron oxide",
			"page_title": "Mars",
			"qid": "Q111",
			"redlink": false,
			"source": "morelike"
		}
	]
}
```

### Availability

**Experimental:** Experimental/community service.

Publicly available Toolforge-hosted service (not a core Wikimedia production API surface).

Cross-wiki in input shape (`lang` + optional `page_title`/`qid`), with availability limited to languages/entities present in the service backends.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 24) Search with ranking profiles

This endpoint runs full-text search and lets you choose ranking profiles with `srqiprofile`.
Profiles such as `popular_inclinks_pv` bias ranking toward high-pageview and high-inlink results.

### Documentation

- [MediaWiki Action API: Search](https://www.mediawiki.org/wiki/API:Search)

### Endpoint

`https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=Jupiter&srlimit=5&srqiprofile=popular_inclinks_pv&srinfo=totalhits`

### Method

`GET`

### Request shape

Query parameters:

- `action=query`
- `list=search`
- `srsearch` (required)
- `srqiprofile` (optional ranking profile, examples include `popular_inclinks_pv`, `wsum_inclinks_pv`)
- `srinfo` (optional metadata, example: `totalhits`)
- `srlimit` (optional)
- `sroffset` (optional continuation offset)
- `format=json`

### Example

#### Request

```bash
curl -sS "https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=Jupiter&srlimit=3&srqiprofile=popular_inclinks_pv&srinfo=totalhits" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"batchcomplete": "",
	"continue": {
		"sroffset": 3,
		"continue": "-||"
	},
	"query": {
		"searchinfo": {
			"totalhits": 26742
		},
		"search": [
			{
				"ns": 0,
				"title": "Jupiter",
				"pageid": 38930,
				"size": 176407,
				"wordcount": 16375,
				"snippet": "<span class=\"searchmatch\">Jupiter</span> is the fifth planet from the Sun, and the largest in the Solar System. It is a gas giant with a mass nearly 2.5 times that of all the other planets",
				"timestamp": "2026-04-19T01:14:29Z"
			},
			{
				"ns": 0,
				"title": "Rory McIlroy",
				"pageid": 3949844,
				"size": 242237,
				"wordcount": 18997,
				"snippet": "Ireland Height 5 ft 9 in (1.75 m) Weight 11+1⁄2 st (161 lb; 73 kg) Residence <span class=\"searchmatch\">Jupiter</span>, Florida, U.S. Spouse Erica Stoll ​ (m. 2017)​ Children 1 Career Turned",
				"timestamp": "2026-04-21T17:35:50Z"
			},
			{
				"ns": 0,
				"title": "Donald Trump",
				"pageid": 4848272,
				"size": 354110,
				"wordcount": 29050,
				"snippet": "York City Mar-a-Lago Golf courses US Bedminster, NJ "Doral" Miami, FL <span class=\"searchmatch\">Jupiter</span>, FL Los Angeles, CA Pine Hill, NJ Washington, D.C. Westchester, NY West",
				"timestamp": "2026-04-24T13:02:19Z"
			}
		]
	}
}
```

_Captured with `srlimit=3`._

### Availability

**Active:** Ranking profile behavior varies by wiki backend configuration.

Publicly available on each wiki's `api.php`; this is a core production MediaWiki Action API module.

Available where the Action API search module is enabled; `srqiprofile` effects depend on search backend/profile support.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 25) Microtask: Articles from category

Toolforge `POST /related-articles` ([Microtask Generator](https://microtask-generator.toolforge.org/), [OpenAPI](https://microtask-generator.toolforge.org/openapi.json)). For scores and edit suggestions after you have titles, see §27 below.

### Documentation

- [OpenAPI](https://microtask-generator.toolforge.org/openapi.json) — `POST /related-articles`, schema `CategoryRequest`

### Endpoint

`https://microtask-generator.toolforge.org/related-articles`

### Method

`POST`

### Request shape

JSON body:

- `lang` (string, required)
- `category` (string, required) — e.g. `Physics`
- `limit` (integer, optional, default 20)

### Example

#### Request

```bash
curl -sS -X POST "https://microtask-generator.toolforge.org/related-articles" \
	-H "Content-Type: application/json" \
	-H "User-Agent: <your tool name> (<contact: URL or email>)" \
	-d '{"lang":"en","category":"Physics","limit":3}'
```

#### Response

```json
{
	"results": ["Physics", "AIC Judd Award", "Atominstitute"]
}
```

### Availability

Toolforge; empty `results` usually means the category did not resolve on that wiki.

### Rate limits

None published.

---

## 26) Microtask: Category name suggestions

Toolforge `GET /category-suggestions` on [Microtask Generator](https://microtask-generator.toolforge.org/). Prefix match on category names (no `Category:` needed for `q` in practice).

### Documentation

- [OpenAPI](https://microtask-generator.toolforge.org/openapi.json) — `GET /category-suggestions`

### Endpoint

`https://microtask-generator.toolforge.org/category-suggestions?lang={lang}&q={query}`

### Method

`GET`

### Request shape

Query parameters:

- `lang` (required)
- `q` (required)

### Example

#### Request

```bash
curl -sS "https://microtask-generator.toolforge.org/category-suggestions?lang=en&q=Physics" \
	-H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"results": [
		"Physics",
		"Physics-based video games",
		"Physics-related lists",
		"Physics Olympiads in India",
		"Physics WikiProjects",
		"Physics articles by importance",
		"Physics articles by quality",
		"Physics articles by quality and importance",
		"Physics articles needing attention",
		"Physics articles needing expert attention"
	]
}
```

### Availability

Toolforge.

### Rate limits

None published.

---

## 27) Microtask: Article quality and suggested edits

Toolforge `POST /quality-check`: per-title quality score, `potential_needs` (concrete suggested edits), topics, pageviews, sitelinks, and feature breakdown. Not part of `api.wikimedia.org` (see OpenAPI). WikiSignals “Run” uses the browser; if that fails, use curl in a terminal.

### Documentation

- [OpenAPI](https://microtask-generator.toolforge.org/openapi.json) — `POST /quality-check`, schema `QualityRequest`
- [About](https://microtask-generator.toolforge.org/about.html)

### Endpoint

`https://microtask-generator.toolforge.org/quality-check`

### Method

`POST`

### Request shape

JSON body:

- `lang` (string)
- `titles` (array of strings)

### Example

#### Request

```bash
curl -sS -X POST "https://microtask-generator.toolforge.org/quality-check" \
	-H "Content-Type: application/json" \
	-H "User-Agent: <your tool name> (<contact: URL or email>)" \
	-d '{"lang":"en","titles":["Cat"]}'
```

#### Response

```json
{
	"lang": "en",
	"results": [
		{
			"title": "Cat",
			"exists": true,
			"quality": "FA",
			"score": 0.9825799824249976,
			"pageviews": 3198294,
			"sitelinks": 276,
			"days_since_edit": 2,
			"potential_needs": [
				{
					"need": "Add more relevant categories",
					"score": 0.4666666666666667
				}
			],
			"article_topics": ["Biology", "STEM"],
			"article_countries": [],
			"features": {
				"raw": {
					"characters": 49245,
					"refs": 318,
					"wikilinks": 448,
					"categories": 7,
					"media": 36,
					"headings": 44,
					"sources": 271,
					"infobox": true,
					"messagebox": false
				},
				"normalized": {
					"characters": 1,
					"refs": 1,
					"wikilinks": 1,
					"categories": 0.4666666666666667,
					"media": 1,
					"headings": 1,
					"sources": 1,
					"infobox": true,
					"messagebox": false
				}
			},
			"lang": "en"
		}
	]
}
```

### Availability

Toolforge; latency grows with batch size.

### Rate limits

None published.

---

## 28) Link suggestions

This endpoint suggests links that could be added to an article.
It returns candidate link text, target pages, and context so you can propose concrete linking edits.

Powers the **add a link** suggestions in the Visual Editor.

### Documentation

- [Link Recommendation API (MediaWiki)](https://www.mediawiki.org/wiki/Link_Recommendation_API)
- [Add-a-link model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Production/add-a-link_model)

### Endpoint

`https://api.wikimedia.org/service/linkrecommendation/v1/linkrecommendations/{project}/{lang}/{title}`

### Method

`GET` (read recommendations)

### Request shape

- Path parameters:
    - `{project}` (example: `wikipedia`)
    - `{lang}` (example: `en`)
    - `{title}` (page title)

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/linkrecommendation/v1/linkrecommendations/wikipedia/en/Earth" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"links": [
		{
			"context_after": " of this m",
			"context_before": "ed by the ",
			"link_index": 0,
			"link_target": "Partial melting",
			"link_text": "partial melting",
			"match_index": 0,
			"score": 0.8778332471847534,
			"wikitext_offset": 23595
		},
		{
			"context_after": ". The two ",
			"context_before": " in ",
			"link_index": 1,
			"link_target": "Sedimentary rock",
			"link_text": "sedimentary rocks",
			"match_index": 0,
			"score": 0.5837271809577942,
			"wikitext_offset": 24840
		},
		{
			"context_after": " within th",
			"context_before": "hanges in ",
			"link_index": 2,
			"link_target": "Crystal structure",
			"link_text": "crystal structure",
			"match_index": 0,
			"score": 0.7161753177642822,
			"wikitext_offset": 40127
		}
		// etc...
	],
	"links_count": 15,
	"meta": {
		"application_version": "4372b3e",
		"dataset_checksums": {
			"anchors": "ab0a4c3fc5dcf9e6404c45eaad1eb463b38673a4936ab3f80e7dcdbf8130dee5",
			"model": "c25a9fb36577a272dd7ca101655d6169bf8a86dbfb1edce7c9b6ee445dec8e71",
			"pageids": "05391e1229aefc087c5076bea2042cddcc0d23bded0f6262cc474898a954c96e",
			"redirects": "56e8089b9d930b4ff77dbc9495c6a2e67c48d8d8a023f9b148e3bbfe5a98665f",
			"w2vfiltered": "59cb88563ca2e0d1992d71d28921f04e902880a9bc9d03081360cbef69fa229c"
		},
		"format_version": 1
	},
	"page_title": "Earth",
	"pageid": 9228,
	"revid": 1350687796
}
```

### Availability

**Active:** No deprecation warning is shown in the referenced docs.

Publicly available via Wikimedia production API traffic.

Path is explicit by project and language (`{project}/{lang}/{title}`); availability is only where that project-language pair has a deployed recommendation model.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 29) Translation suggestions

This endpoint recommends articles to translate from one language wiki to another.
It returns ranked candidate articles based on source/target languages and optional seed or topic inputs.

### Documentation

- [Lift Wing API reference: content translation recommendation](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_content_translation_recommendation)
- [Interactive recommendation API docs](https://api.wikimedia.org/service/lw/recommendation/api/docs)

### Endpoint

`https://api.wikimedia.org/service/lw/recommendation/api/v1/translation`

### Method

`GET`

### Request shape

Query parameters:

- `source` (required): source wiki language code (example: `en`)
- `target` (required): target wiki language code (example: `fr`)
- `count` (optional, default `12`)
- `seed` (optional)
- `topic` (optional)
- `include_pageviews` (optional, default `false`)
- `search_algorithm` (optional, default `morelike`)
- `rank_method` (optional, default `default`)

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/recommendation/api/v1/translation?source=en&target=fr&count=2&seed=Apple&include_pageviews=true" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"recommendations": [
		{
			"title": "Summer squash",
			"pageviews": 120,
			"wikidata_id": "Q17119307",
			"rank": 265,
			"langlinks_count": 6,
			"size": 7529,
			"lead_section_size": null,
			"collection": null
		},
		{
			"title": "Winesap",
			"pageviews": 22,
			"wikidata_id": "Q16878488",
			"rank": 282,
			"langlinks_count": 3,
			"size": 5427,
			"lead_section_size": null,
			"collection": null
		}
	],
	"continue_offset": null,
	"continue_seed": null
}
```

### Availability

**Active:** Some request options are marked experimental in ecosystem documentation.

Publicly available via Wikimedia's production recommendation API.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

---

## 30) Article descriptions

This endpoint generates short description text for an article title and language.
It returns one or more candidate descriptions that can be used as summary snippets.

### Documentation

- [Lift Wing API reference: article descriptions](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_article_descriptions)
- [Article descriptions model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Proposed/Article_descriptions)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/article-descriptions:predict`

### Method

`POST`

### Request shape

```json
{
	"lang": "en",
	"title": "Clandonald",
	"num_beams": 2,
	"debug": 1
}
```

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/article-descriptions:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"lang":"en","title":"Clandonald","num_beams":2,"debug":1}'
```

#### Response

```json
{
	"lang": "en",
	"title": "Clandonald",
	"blp": false,
	"num_beams": 2,
	"groundtruth": "Hamlet in Alberta, Canada",
	"latency": {
		"wikidata-info (s)": 0.10568404197692871,
		"mwapi - first paragraphs (s)": 0.11831045150756836,
		"total network (s)": 0.153550386428833,
		"model (s)": 6.823495864868164,
		"total (s)": 6.977058410644531
	},
	"features": {
		"descriptions": {
			"fr": "hameau d'Alberta",
			"en": "hamlet in central Alberta, Canada"
		},
		"first-paragraphs": {
			"en": "Clandonald is a hamlet in central Alberta, Canada within the County of Vermilion River. It is located approximately 28 kilometres (17 mi) north of Highway 16 and 58 kilometres (36 mi) northwest of Lloydminster.",
			"fr": "Clandonald est un hameau (hamlet) du Comté de Vermilion River, situé dans la province canadienne d'Alberta."
		}
	},
	"prediction": ["Hamlet in Alberta, Canada", "human settlement in Alberta, Canada"]
}
```

### Availability

**Active:** Output quality can vary by language and topic domain.

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 31) Edit types

This endpoint analyzes a revision diff and labels the kinds of changes made.
Depending on the route, it returns summary counts, detailed structured changes, or debug output.

### Documentation

- [edit-types Swagger docs](https://edit-types.wmcloud.org/docs)
- [edit-types project repository](https://github.com/geohci/edit-types)

### Endpoint

- `https://edit-types.wmcloud.org/diff-summary`
- `https://edit-types.wmcloud.org/diff-details`
- `https://edit-types.wmcloud.org/diff-debug`

### Method

`GET`

### Request shape

Query params:

- `lang`
- `revid`
- optional `content_type`

### Example 1: Diff summary

#### Request

```bash
curl -sS "https://edit-types.wmcloud.org/diff-summary?lang=en&revid=1350687796" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"article": "https://en.wikipedia.org/wiki/?oldid=1350687796",
	"summary": {
		"Wikilink": {
			"change": 1,
			"insert": 1
		},
		"Section": {
			"change": 1
		},
		"Media": {
			"change": 1
		},
		"Template": {
			"change": 1
		}
	}
}
```

### Example 2: Diff details

#### Request

```bash
curl -sS "https://edit-types.wmcloud.org/diff-details?lang=en&revid=1350687796" \
  -H "User-Agent: <your tool name> (<contact: URL or email>)"
```

#### Response

```json
{
	"article": "https://en.wikipedia.org/wiki/?oldid=1350687796",
	"summary": {
		"Wikilink": {
			"insert": 1,
			"change": 1
		},
		"Template": {
			"change": 1
		},
		"Media": {
			"change": 1
		},
		"Section": {
			"change": 1
		}
	},
	"details": "…(truncated: full response includes per-change detail arrays)"
}
```

### Availability

**Experimental:** Experimental/community service. Behavior and availability may change.

Publicly available Toolforge/WMCS-hosted service (not a core Wikimedia production API surface).

Cross-wiki in input shape (`lang` + `revid`), with real availability determined by whether the service can fetch and analyze that revision for the requested language wiki.

### Rate limits

[Wikimedia APIs/Rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits)

[API:Etiquette](https://www.mediawiki.org/wiki/API:Etiquette)

## 32) Language identification

This endpoint detects the language of input text.
It returns language identifiers and a confidence score for the detected language.

### Documentation

- [Lift Wing API reference: language identification prediction](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_language_identification_prediction)
- [Language identification model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Proposed/Language_Identification)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/langid:predict`

### Method

`POST`

### Request shape

```json
{
	"text": "This is an English sentence about Wikipedia and machine learning."
}
```

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/langid:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"text":"Bonjour le monde"}'
```

#### Response

```json
{
	"language": "fra_Latn",
	"wikicode": "fr",
	"languagename": "French",
	"score": 0.9967567920684814
}
```

### Availability

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

Not tied to a specific wiki; works on raw input text.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)

---

## 33) Article country

This endpoint predicts which countries are most relevant to an article.
You provide article title and language, and it returns country candidates with scores and source evidence.

### Documentation

- [Lift Wing API reference: article country](https://api.wikimedia.org/wiki/Lift_Wing_API/Reference/Get_article_country)
- [Article country model card](https://meta.wikimedia.org/wiki/Machine_learning_models/Proposed/Article_country)

### Endpoint

`https://api.wikimedia.org/service/lw/inference/v1/models/article-country:predict`

### Method

`POST`

### Request shape

```json
{
	"lang": "en",
	"title": "Toni_Morrison"
}
```

### Example

#### Request

```bash
curl -sS "https://api.wikimedia.org/service/lw/inference/v1/models/article-country:predict" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Api-User-Agent: <your tool name> (<contact: URL or email>)" \
  -d '{"lang":"en","title":"Earth"}'
```

#### Response

```json
{
	"model_name": "article-country",
	"model_version": "1",
	"prediction": {
		"article": "https://en.wikipedia.org/wiki/Earth",
		"wikidata_item": "Q2",
		"results": []
	}
}
```

### Availability

Publicly available on `api.wikimedia.org`, served by Wikimedia's production Lift Wing inference platform.

### Rate limits

[LiftWing external usage rate limits](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage)
