(
	function ( global, factory ){

		( global = global || self, factory( global.Neural = {} ) );

	}(this, function ( exports ){

		const Learning_Rate = 0.1;

		class Matrix{
			constructor ( lines, columns ){

				this.lines = lines;
				this.columns = columns;
				this.matrix = new Array( lines );

				for ( var i = 0; i < this.lines; i++ ){

					this.matrix[ i ] = new Array();

					for ( var ii = 0; ii < this.columns; ii++ ){

						this.matrix[ i ][ ii ] = 0;

					}

				}

			}

			Inject( arr ){

				var c = 0;
				for ( var a = 0; a < this.lines; a++ ){

					for ( var b = 0; b < this.columns; b++ ){

						this.matrix[a][b] = arr[c];
						c++;
					}

				}

			}

			static Multiply( mtx1, mtx2 ){


				var k = 0;
				var arr = new Matrix( mtx1.lines, mtx2.columns );

				for (var a = 0; a < mtx2.columns; a++ ){//add Column lay2

				    for ( var b = 0; b < mtx1.lines; b++ ){//add Line lay1

				        for ( var c = 0; c < mtx1.columns; c++ ){//add Column lay1

				            k += mtx1.matrix[b][c] * mtx2.matrix[c][a];

				            //console.log( "Agora multiplicando:\n["+b+"]["+c+"]\nValor:"+mtx1.matrix[b][c]+" \nX \n["+c+"]["+a+"]\nValor: "+mtx2.matrix[c][a]+" : \nAcumulado ( k ) -> "+k);

				        }

				        arr.matrix[b][a] = k;
				        k = 0;

				    }

				}

				return arr;

			}

			static Add( mtx1, mtx2 ){//type Matrix

				var arr = new Matrix( mtx1.lines, mtx2.columns );

				/*console.log( mtx1 );
				console.log( mtx2 );*/

				for ( var a = 0; a < mtx1.lines; a++ ){

					for ( var b = 0; b < mtx2.columns; b++ ){

						arr.matrix[a][b] = mtx1.matrix[a][b] + mtx2.matrix[a][b];

					}

				}

				return arr;

			}

			static Subtract( mtx1, mtx2 ){//type Matrix

				var arr = new Matrix( mtx1.lines, mtx2.columns );

				for ( var a = 0; a < mtx1.lines; a++ ){

					for ( var b = 0; b < mtx2.columns; b++ ){
							
						arr.matrix[a][b] = mtx1.matrix[a][b] - mtx2.matrix[a][b];

					}

				}

				return arr;

			}

			static Transpose( mtx ){

				var newMtx = new Matrix( mtx.columns, mtx.lines );
				for ( var a = 0; a < mtx.columns; a++ ){
					for ( var b = 0; b < mtx.lines; b++ ){
						newMtx.matrix[a][b] = mtx.matrix[b][a];
					}
				}


				return newMtx;

			}

			static Hadamard( mtx1, mtx2 ){ //type Matrix

				var mtxR = new Matrix( mtx1.lines, mtx2.columns );
				for ( var a = 0; a < mtx1.lines; a++ ){

					for ( var b = 0; b < mtx1.columns; b++ ){

						mtxR.matrix[a][b] = mtx1.matrix[a][b] * mtx2.matrix[a][b];;

					}

				}

				return mtxR;

			}

			static ScalarMatrix( mtx, scalar ){
				var matrix = new Matrix( mtx.lines, mtx.columns );

				matrix.matrix = mtx.matrix.map( ( arr, i ) => {
					return arr.map( ( elm, j ) => {
						return elm * scalar;
					} );
				});

				return matrix;

			}

			static map ( mtx, func ){
				var matrix = new Matrix( mtx.lines, mtx.columns );

				matrix.matrix = mtx.matrix.map( ( arr, i ) =>{
					return arr.map( ( num, j ) => {
						return func( num, i, j );
					} )
				} )

				return matrix;

			}

			static ArrayToMatrix( arr ){
				var matrix = new Matrix( arr.length, 1 );
				
				matrix.matrix = matrix.matrix.map( ( e, i ) =>{
					return [arr[i]];
				});
				return matrix;
			}

			static MatrixToArray( obj ){

				var k = [];
				var arr = obj.matrix.map( ( arr, i ) => {
					arr.map( ( elm, j ) => {
						k.push( elm );
					} )
				} )

				return k;

			}

		}

		class Init{
			constructor( rangeInput, rangeHidden, rangeOutput ){

				this.Input = {
					length: rangeInput,
					values: new Matrix( rangeInput, 1 )
				};
				this.Hidden = {
					length: rangeHidden,
					values: new Matrix( rangeHidden, 1 )
				};
				this.Output = {
					length: rangeOutput,
					values: new Matrix( rangeOutput, 1 )
				};
				this.Weights = {
					I_H: new Weight( this.Input, this.Hidden ),
					H_O: new Weight( this.Hidden, this.Output )
				};

				this.Bias = [
					new Matrix( rangeHidden, 1 ),
					new Matrix( rangeOutput, 1 )
				];

				this.addBiasValues();

			}

			addBiasValues(){

				for ( var a = 0; a < this.Bias.length; a++ ){

					for ( var b = 0; b < this.Bias[a].lines; b++ ){

						for ( var c = 0; c < this.Bias[a].columns; c++ ){

							this.Bias[a].matrix[b][c] = Math.random()*2 - 1;

						}

					}

				}

			}

			setInput( values ){

				//Envelopando...
				var a = values.map( function ( e ){

					return [ e ];

				})

				this.Input.values.matrix = a;

			}

		}

		function Randomize ( min, max=null ){

			if ( max == null ){ return Math.floor( Math.random( ) * ( min + 1 ) ); }
			else { return min + Math.floor( Math.random() * ( max - min ) + 1 ); }

		}


		function Weight ( lay1, lay2 ){

			var l1 = lay1.values.lines;
			var l2 = lay2.values.lines;

			var weight = new Matrix ( l2, l1 );

			for ( var i = 0; i < weight.lines; i++ ){

				for ( var ii = 0; ii < weight.columns; ii++ ){

					weight.matrix[ i ][ ii ] = Math.random()*2 - 1;

				}

			}

			return weight;

			//Cada Linha do Weight corresponde ao index do neurônio resultante, os elementos dentro da linha são os valores que o resultante recebe; 
			//Cada Coluna do Weight corresponde ao index do neurônio inicial, os lemenetos dentro da linha são todos os weights que serão multiplicados;

		}		

		function FeedForwards ( brain ){

			var input = brain.Input;
			var hidden = brain.Hidden;
			var output = brain.Output;
			var bias = brain.Bias;

			//iho

			var weights = {
				ih: brain.Weights.I_H,
				ho: brain.Weights.H_O
			}

			var bias = [
				brain.Bias[0],
				brain.Bias[1]
			]

			//Pesos etre Input e & Hidden1
			hidden.values = Matrix.Multiply( weights.ih, input.values );

			//Inserindo Bias
			hidden.values = Matrix.Add( hidden.values, brain.Bias[0] );
			hidden.values = Matrix.map( hidden.values, sigmoid );

			//Output

			output.values = Matrix.Multiply( weights.ho, hidden.values );

			//Inserindo Bias

			output.values = Matrix.Add( output.values, brain.Bias[1] );
			output.values = Matrix.map( output.values, sigmoid );

			//Getting Result

			this.input = input;
			this.hidden = hidden;
			this.output = output;
			this.weights = weights;
			this.bias = bias;
		}

		function BackPropagation( feed, expected ){

			var MSE = 0;

			var input = feed.input.values;
			var output = feed.output.values;
			var hidden = feed.hidden.values;
			var weightsHO = feed.weights.ho;
			var weightsIH = feed.weights.ih;

			var outputErrors = new Matrix( output.lines, output.columns );
			var hiddenErrors = new Matrix( weightsHO.columns, weightsHO.lines );
			var expected = Matrix.ArrayToMatrix(expected);

			outputErrors = Matrix.Subtract( expected, output );

			//D_sigmoid - output
			var d_output = Matrix.map( output, dsigmoid );

			// Output --→ Hidden

			var transHidden = Matrix.Transpose( hidden );
			var DeltaW_ho = Matrix.Hadamard( outputErrors, d_output );
			DeltaW_ho = Matrix.ScalarMatrix( DeltaW_ho, Learning_Rate );

			//adjust Bias
			feed.bias[1] = Matrix.Add(feed.bias[1], DeltaW_ho)

			DeltaW_ho = Matrix.Multiply( DeltaW_ho, transHidden );
			weightsHO = Matrix.Add(weightsHO, DeltaW_ho);


			// Hidden --→ Input
			var transWeight = Matrix.Transpose( weightsHO );
			hiddenErrors = Matrix.Multiply(transWeight, outputErrors);

			//D_sigmoid - hidden
			var d_hidden = Matrix.map( hidden, dsigmoid );

			var transInput = Matrix.Transpose( input );

			var DeltaW_ih = Matrix.Hadamard( hiddenErrors, d_hidden );
			DeltaW_ih = Matrix.ScalarMatrix( DeltaW_ih, Learning_Rate );

			//Adjust Bias
			feed.bias[0] = Matrix.Add( feed.bias[0], DeltaW_ih );

			DeltaW_ih = Matrix.Multiply( DeltaW_ih, transInput );
			weightsIH = Matrix.Add( weightsIH, DeltaW_ih );


			this.DeltaW = {
				Output_To_Hidden: DeltaW_ho,
				Hidden_To_Input: DeltaW_ih
			}
			this.D_Output = d_output;
			this.hiddenErrors = hiddenErrors;
			this.outputErrors = outputErrors;
			this.Input = feed.input;
			this.Weights = {
				I_H: weightsIH,
				H_O: weightsHO
			};
			this.Bias = [
				feed.bias[0],
				feed.bias[1]
			];
			this.MSE = MSE;
			this.expected = expected;

		}

		function Predict( input, brain ){

			brain.setInput( input );
			var Prediction = new FeedForwards( brain );
			Prediction.output = Matrix.MatrixToArray( Prediction.output.values );

			var Hv = -1; var Hvi = 0;
			Prediction.output.forEach( function ( e, i ){
				if ( Prediction.output[i] >= Hv ){
					Hv = Prediction.output[i];
					Hvi = i;
				}
			});

			return {
				Outputs: Prediction.output,
				HighestValue: Hv,
				ChosenNeuron: Hvi
			}

		}

		function StartNeurons( input, expected, brain ){

			brain.setInput( input );
			var Initiation = new FeedForwards( brain );
			var response = new BackPropagation( Initiation, expected );

			brain.Weights = response.Weights;
			brain.Bias = response.Bias;

		}


		function sigmoid ( x ){
			return  1 / ( 1 + Math.exp( -x ) );
		}
		function dsigmoid( x ){
			return x * ( 1 - x );
		}
		function Data( input, output ){

			this.input = input;
			this.output = output;

		}


		exports.Init = Init;
		exports.Weight = Weight;
		exports.FeedForwards = FeedForwards;	
		exports.BackPropagation = BackPropagation;
		exports.Randomize = Randomize;
		exports.sigmoid = sigmoid;
		exports.Matrix = Matrix;
		exports.Learning_Rate = Learning_Rate;
		exports.StartNeurons = StartNeurons;
		exports.Predict = Predict;
		exports.Data = Data;

	})
)